#include "MessageQueueServer.hpp"

#include "messages/Input.hpp"
#include "messages/Join.hpp"

#include <array>
#include <cstdint>
#include <iostream>
#include <limits>

// For htonl and ntohl
#ifdef _MSC_VER
#include <winsock2.h>
#else
#include <sys/socket.h>
#endif

// -----------------------------------------------------------------
//
// Create three threads for the message queue:
//  1. Listen for incoming client connections
//  2. Listen for incoming messages
//  3. Sending of messages
//
// -----------------------------------------------------------------
bool MessageQueueServer::initialize(std::uint16_t listenPort)
{
    // Register the message types with the handler that can create a message object
    // of the appropriate type.
    m_messageCommand[messages::Type::Join] = []() {
        return std::make_shared<messages::Join>();
    };
    m_messageCommand[messages::Type::Input] = []() {
        return std::make_shared<messages::Input>();
    };

    initializeListener(listenPort);
    initializeSender();
    initializeReceiver();

    return true;
}

// --------------------------------------------------------------
//
// Gracefully shut things down
// TODO: Not yet done
//
// --------------------------------------------------------------
void MessageQueueServer::shutdown()
{
    m_keepRunning = false;
    m_listener.close();
}

// -----------------------------------------------------------------
//
// Two steps in sending a message:
//  1. Add the message the the message queue
//  2. Signal the thread that performs the sending that a new message is available
//
// -----------------------------------------------------------------
void MessageQueueServer::sendMessage(std::uint64_t clientId, std::shared_ptr<messages::Message> message, std::optional<std::uint32_t> messageId)
{
    //
    // The reason messageId is part of the tuple rather than directly setting it on
    // the message at this point is that broadcast messages are not copies, but we
    // want each message that goes out to a client to have the unique per-client
    // last message sequence number attached to it.  Right before the message
    // is sent in the sender thread, the messageId is set on the message, ensure
    // the correct sequence number is sent to the client.
    m_sendMessages.enqueue(std::make_tuple(clientId, messageId, message));
    m_eventSendMessages.notify_one();
}

// -----------------------------------------------------------------
//
// Some messages go back to the client with the id of the last message
// processed by the server.  This is for use in client-side server
// reconciliation.
//
// -----------------------------------------------------------------
void MessageQueueServer::sendMessageWithLastId(std::uint64_t clientId, std::shared_ptr<messages::Message>& message)
{
    sendMessage(clientId, message, m_clientLastMessageId[clientId]);
}

// -----------------------------------------------------------------
//
// Send the message to all connected clients.
//
// -----------------------------------------------------------------
void MessageQueueServer::broadcastMessage(std::shared_ptr<messages::Message> message)
{
    std::lock_guard<std::mutex> lock(m_mutexSockets);

    for (auto& [clientId, socket] : m_sockets)
    {
        sendMessage(clientId, message);
    }
}

// -----------------------------------------------------------------
//
// Send the message to all connected clients, but also including the
// last message sequence number processed by the server.
//
// -----------------------------------------------------------------
void MessageQueueServer::broadcastMessageWithLastId(std::shared_ptr<messages::Message> message)
{
    std::lock_guard<std::mutex> lock(m_mutexSockets);

    for (auto& [clientId, socket] : m_sockets)
    {
        sendMessageWithLastId(clientId, message);
    }
}

// --------------------------------------------------------------
//
// Returns the queue of all messages received since the last time
// this method was called.
//
// --------------------------------------------------------------
std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> MessageQueueServer::getMessages()
{
    std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> copy;

    std::lock_guard<std::mutex> lock(m_mutexReceivedMessages);
    std::swap(copy, m_receivedMessages);

    return copy;
}

// --------------------------------------------------------------
//
// Utility to combine an IP address value and Port into a single
// 64 bit number for unique identification of each client.
//
// --------------------------------------------------------------
std::uint64_t MessageQueueServer::socketToId(sf::TcpSocket* socket)
{
    std::uint64_t id = socket->getRemoteAddress().toInteger() + (static_cast<std::uint64_t>(socket->getRemotePort()) << 32);
    return id;
}

// --------------------------------------------------------------
//
// Listen for incoming client connections.  As a connection is made
// remember it and begin listening for messages over that socket.
//
// --------------------------------------------------------------
void MessageQueueServer::initializeListener(std::uint16_t listenPort)
{
    m_threadListener = std::thread([listenPort, this]() {
        if (m_listener.listen(listenPort) != sf::Socket::Done)
        {
            std::cout << "error initializing network socket" << std::endl;
        }
        else
        {
            std::cout << "successfully initialized sockets" << std::endl;
        }

        while (m_keepRunning)
        {
            auto socket = std::make_unique<sf::TcpSocket>();
            if (m_listener.accept(*socket) != sf::Socket::Done)
            {
                std::cout << "error in accepting client connection" << std::endl;
            }
            else
            {
                std::cout << "new client connection accepted" << std::endl;
                m_selector.add(*socket);
                auto clientId = socketToId(socket.get());
                {
                    std::lock_guard<std::mutex> lock(m_mutexSockets);
                    m_sockets[clientId] = std::move(socket);
                }
                m_connectHandler(clientId);
            }
        }

        std::cout << "incoming network connection listener shutdown" << std::endl;
    });
}

// --------------------------------------------------------------
//
// Prepares the message queue for sending of messages.  As messages
// are added to the queue of messages to send, the thread created
// in this method sends them as soon as it can.
//
// --------------------------------------------------------------
void MessageQueueServer::initializeSender()
{
    m_threadSender = std::thread([this]() {
        std::unordered_set<std::uint64_t> disconnectedClient;
        while (m_keepRunning)
        {
            auto item = m_sendMessages.dequeue();
            if (item)
            {
                // Destructure and send
                auto& [clientId, messageId, message] = item.value();
                // Creating this scope so the m_mutexSockets is released, allowing the removeDisconnected function
                // to be called, because it also wants to grab that mutex.
                // Note: Might be able to use a recursive_mutex instead
                {
                    std::lock_guard<std::mutex> lock(m_mutexSockets);
                    // Some messages have a sequence number associated with them, if they do,
                    // then set it on the message.
                    if (messageId)
                    {
                        message->setMessageId(messageId.value());
                    }
                    if (m_sockets.find(clientId) != m_sockets.end())
                    {
                        std::string serialized = message->serializeToString();

                        //
                        // Need to send a header before the message data that specifies
                        // the message type and the size of data to expect.
                        std::array<std::uint8_t, 5> header;
                        header[0] = static_cast<std::uint8_t>(message->getType());
                        std::uint32_t messageSize = htonl(static_cast<std::uint32_t>(serialized.size()));
                        std::uint8_t* ptrSize = reinterpret_cast<std::uint8_t*>(&messageSize);
                        header[1] = ptrSize[0];
                        header[2] = ptrSize[1];
                        header[3] = ptrSize[2];
                        header[4] = ptrSize[3];

                        // Send the header
                        m_sockets[clientId]->send(header.data(), header.size());
                        // Send the message body
                        if (serialized.size() > 0)
                        {
                            auto status = m_sockets[clientId]->send(static_cast<void*>(serialized.data()), serialized.size());
                            if (status == sf::Socket::Disconnected)
                            {
                                disconnectedClient.insert(clientId);
                            }
                        }
                    }
                }
                removeDisconnected(disconnectedClient);
            }
            else
            {
                //
                // If no messages available to send, then wait until an event
                // is fired letting us know one is now ready to send.
                std::unique_lock<std::mutex> lock(m_mutexEventSendMessages);
                m_eventSendMessages.wait(lock);
            }
        }
    });
}

// --------------------------------------------------------------
//
// Sets up a thread that listens for incoming messages on all
// known client sockets.  If there is something to receive on a
// socket, the message is read, parsed, and added to the queue
// of received messages.
//
// --------------------------------------------------------------
void MessageQueueServer::initializeReceiver()
{
    m_threadReceiver = std::thread([this]() {
        std::unordered_set<std::uint64_t> disconnectedClients;
        while (m_keepRunning)
        {
            if (m_selector.wait(sf::seconds(1.0f)))
            {
                // Have to iterate through all of them to find out which one(s) are ready
                std::lock_guard<std::mutex> lockSockets(m_mutexSockets);
                for (auto& [clientId, socket] : m_sockets)
                {
                    if (m_selector.isReady(*socket))
                    {
                        std::array<messages::Type, 1> type;
                        std::array<uint32_t, 1> size;
                        std::size_t received;
                        auto status = socket->receive(type.data(), 1, received);
                        if (status == sf::Socket::Done)
                        {
                            if (socket->receive(size.data(), sizeof(std::uint32_t), received) == sf::Socket::Done)
                            {
                                // Convert back from network representation
                                size[0] = ntohl(size[0]);
                                //
                                // The message may not have any payload, don't try to read in that case
                                if (size[0] > 0)
                                {
                                    std::string data;
                                    data.resize(size[0]);
                                    if (socket->receive(data.data(), size[0], received) == sf::Socket::Done)
                                    {
                                        auto message = m_messageCommand[type[0]]();
                                        message->parseFromString(data);
                                        if (message->getMessageId())
                                        {
                                            m_clientLastMessageId[clientId] = message->getMessageId().value();
                                        }
                                        std::lock_guard<std::mutex> lock(m_mutexReceivedMessages);
                                        m_receivedMessages.push(std::make_tuple(socketToId(socket.get()), message));
                                    }
                                }
                                else
                                {
                                    auto message = m_messageCommand[type[0]]();
                                    std::lock_guard<std::mutex> lock(m_mutexReceivedMessages);
                                    m_receivedMessages.push(std::make_tuple(socketToId(socket.get()), message));
                                }
                            }
                        }
                        else if (status == sf::Socket::Disconnected)
                        {
                            disconnectedClients.insert(clientId);
                        }
                    }
                }
            }
            else
            {
                //
                // If there aren't any active sockets, the selector.wait falls through immediately
                // causing a very busy wait loop.  To cut down on the business of the loop, going
                // to sleep for a bit.  I know a condition_variable could be used to be even more
                // efficient, but I didn't do that because it adds complexity for a benefit that
                // isn't necessary.
                if (m_sockets.size() == 0)
                {
                    std::this_thread::sleep_for(std::chrono::milliseconds(500));
                }
            }

            removeDisconnected(disconnectedClients);
        }
    });
}

// --------------------------------------------------------------
//
// For any clients that are no longer connected, they are removed
// from the socket selector, along with being remove from the
// list of active sockets maintained by this message queue.
//
// --------------------------------------------------------------
void MessageQueueServer::removeDisconnected(std::unordered_set<std::uint64_t>& clients)
{
    if (clients.size() > 0)
    {
        {
            std::lock_guard<std::mutex> lock(m_mutexSockets);
            for (auto clientId : clients)
            {
                auto& socket = m_sockets[clientId];
                m_selector.remove(*socket);
                m_sockets.erase(clientId);
                m_clientLastMessageId.erase(clientId);
            }
        }
        //
        // Have to do this in a different scope from the mutex lock above
        // because the disconnect handler calls back into the message queue
        // to broadcast messages.  This is bad, bad, because it means this code
        // knows something about the implementation of the disconnect handler.
        // I'll keep thinking about this to find a better overall solution.
        for (auto clientId : clients)
        {
            m_disconnectHandler(clientId);
        }
        clients.clear();
    }
}
