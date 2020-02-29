#include "MessageQueueClient.hpp"

#include "messages/ConnectAck.hpp"
#include "messages/NewEntity.hpp"
#include "messages/RemoveEntity.hpp"
#include "messages/UpdateEntity.hpp"

#include <array>
#include <cstdint>

// For htonl and ntohl
#ifdef _MSC_VER
#include <winsock2.h>
#else
#include <sys/socket.h>
#endif

// -----------------------------------------------------------------
//
// Create two threads for the message queue:
//  1. Listen for incoming messages
//  2. Sending messages
//
// -----------------------------------------------------------------
bool MessageQueueClient::initialize(std::string serverIP, std::uint16_t serverPort)
{
    m_socketServer = std::make_unique<sf::TcpSocket>();
    if (m_socketServer->connect(serverIP, serverPort) != sf::Socket::Done)
    {
        return false;
    }

    m_selector.add(*m_socketServer);

    // Register the message types with the handler that can create a message object
    // of the appropriate type.
    m_messageCommand[messages::Type::ConnectAck] = []() {
        return std::make_shared<messages::ConnectAck>();
    };
    m_messageCommand[messages::Type::NewEntity] = []() {
        return std::make_shared<messages::NewEntity>();
    };
    m_messageCommand[messages::Type::UpdateEntity] = []() {
        return std::make_shared<messages::UpdateEntity>();
    };
    m_messageCommand[messages::Type::RemoveEntity] = []() {
        return std::make_shared<messages::RemoveEntity>();
    };

    initializeSender();
    initializeReceiver();

    return true;
}

// -----------------------------------------------------------------
//
// Gracefully shutdown the network connection and related activities
//
// -----------------------------------------------------------------
void MessageQueueClient::shutdown()
{
    m_socketServer->disconnect();
}

// -----------------------------------------------------------------
//
// Two steps in sending a message:
//  1. Add the message the the message queue
//  2. Signal the thread that performs the sending that a new message is available
//
// -----------------------------------------------------------------
void MessageQueueClient::sendMessage(std::shared_ptr<messages::Message> message)
{
    m_sendMessages.enqueue(message);
    m_eventSendMessages.notify_one();
}

// -----------------------------------------------------------------
//
// Some messages need to be sent with a sequence number, when that
// is needed, this send method is used.
//
// -----------------------------------------------------------------
void MessageQueueClient::sendMessageWithId(std::shared_ptr<messages::Message> message)
{
    message->setMessageId(m_nextMessageId++);
    sendMessage(message);
}

// --------------------------------------------------------------
//
// Returns the queue of all messages received since the last time
// this method was called.
//
// --------------------------------------------------------------
std::queue<std::shared_ptr<messages::Message>> MessageQueueClient::getMessages()
{
    std::queue<std::shared_ptr<messages::Message>> copy;

    std::lock_guard<std::mutex> lock(m_mutexReceivedMessages);
    std::swap(copy, m_receivedMessages);

    return copy;
}

// --------------------------------------------------------------
//
// Removes all messages up to and including the lastMessageId, and
// then returns a copy of the remaining messages.  This is used
// during server reconciliation.
//
// --------------------------------------------------------------
std::queue<std::shared_ptr<messages::Message>> MessageQueueClient::getSendMessageHistory(std::uint32_t lastMessageId)
{
    //
    // Remove messages up to and including lastMessageId
    while (!m_sendHistory.empty() && m_sendHistory.front()->getMessageId().value() <= lastMessageId)
    {
        m_sendHistory.pop();
    }

    //
    // Make a copy of the queue and return that
    return std::queue<std::shared_ptr<messages::Message>>(m_sendHistory);
}

// --------------------------------------------------------------
//
// Prepares the message queue for sending of messages.  As messages
// are added to the queue of messages to send, the thread created
// in this method sends them as soon as it can.
//
// --------------------------------------------------------------
void MessageQueueClient::initializeSender()
{
    m_threadSender = std::thread([this]() {
        while (m_keepRunning)
        {
            auto item = m_sendMessages.dequeue();
            if (item)
            {
                // Need to track messages with a sequence number for server reconciliation
                if (item.value()->getMessageId())
                {
                    m_sendHistory.push(item.value());
                }

                //
                // Need to send a header before the message data that specifies
                // the message type and the size of data to expect.
                std::array<std::uint8_t, 5> header;
                header[0] = static_cast<std::uint8_t>(item.value()->getType());
                // Convert to network representation
                std::string serialized = item.value()->serializeToString();
                std::uint32_t messageSize = htonl(static_cast<std::uint32_t>(serialized.size()));
                std::uint8_t* ptrSize = reinterpret_cast<std::uint8_t*>(&messageSize);
                header[1] = ptrSize[0];
                header[2] = ptrSize[1];
                header[3] = ptrSize[2];
                header[4] = ptrSize[3];

                // Send the header
                m_socketServer->send(header.data(), header.size());
                // Send the message body
                if (serialized.size() > 0)
                {
                    m_socketServer->send(static_cast<void*>(serialized.data()), serialized.size());
                }
            }
            else
            {
                //
                // If no messages available to sent, then wait until an event
                // is fired letting us know one is now ready to send.
                std::unique_lock<std::mutex> lock(m_mutexEventSendMessages);
                m_eventSendMessages.wait(lock);
            }
        }
    });
}

// --------------------------------------------------------------
//
// Set's up a thread that listens for incoming messages on the socket
// to the server.  If there is something to receive, the message is
// read, parsed, and added to the queue of received messages.
//
// --------------------------------------------------------------
void MessageQueueClient::initializeReceiver()
{
    m_threadReceiver = std::thread([this]() {
        while (m_keepRunning)
        {
            if (m_selector.wait(sf::seconds(1.0f)))
            {
                if (m_selector.isReady(*m_socketServer))
                {
                    std::array<messages::Type, 1> type;
                    std::array<uint32_t, 1> size;
                    std::size_t received;
                    if (m_socketServer->receive(type.data(), 1, received) == sf::Socket::Done)
                    {
                        if (m_socketServer->receive(size.data(), sizeof(std::uint32_t), received) == sf::Socket::Done)
                        {
                            // Convert back from network representation
                            size[0] = ntohl(size[0]);
                            if (size[0] > 0)
                            {
                                std::string data;
                                data.resize(size[0]);
                                if (m_socketServer->receive(data.data(), size[0], received) == sf::Socket::Done)
                                {
                                    auto message = m_messageCommand[type[0]]();
                                    message->parseFromString(data);
                                    std::lock_guard<std::mutex> lock(m_mutexReceivedMessages);
                                    m_receivedMessages.push(message);
                                }
                            }
                            else
                            {
                                auto message = m_messageCommand[type[0]]();
                                std::lock_guard<std::mutex> lock(m_mutexReceivedMessages);
                                m_receivedMessages.push(message);
                            }
                        }
                    }
                }
            }
        }
    });
}
