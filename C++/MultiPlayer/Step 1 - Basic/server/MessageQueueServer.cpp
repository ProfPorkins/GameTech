#include "MessageQueueServer.hpp"

#include "messages/ConnectSelf.hpp"

#include <array>
#include <cstdint>
#include <iostream>

// For htonl and ntohl
#ifdef _MSC_VER
#include <winsock2.h>
#else
#include <sys/socket.h>
#endif

namespace messages
{
    // -----------------------------------------------------------------
    //
    // Create several threads for the message queue:
    //  1. Listen for incoming client connections
    //  2. Listen for incoming messages
    //  3. Send messages
    //
    // -----------------------------------------------------------------
    bool MessageQueueServer::initialize(std::uint16_t listenPort, std::function<void(sf::Uint32)> onClientConnected)
    {
        m_onClientConnected = onClientConnected;

        initializeListener(listenPort);
        initializeSender();
        initializeReceiver();

        return true;
    }

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
    void MessageQueueServer::sendMessage(sf::Uint32 clientId, std::shared_ptr<Message> message)
    {
        {
            m_sendMessages.enqueue(std::make_tuple(clientId, message));
            m_eventSendMessages.notify_one();
        }
    }

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
                    auto clientId = socket->getRemoteAddress().toInteger();
                    {
                        std::lock_guard<std::mutex> lock(m_mutexSockets);
                        m_sockets[clientId] = std::move(socket);
                    }
                    m_onClientConnected(clientId);
                }
            }

            std::cout << "incoming network connection listener shutdown" << std::endl;
        });
    }

    void MessageQueueServer::initializeSender()
    {
        m_threadSender = std::thread([this]() {
            while (m_keepRunning)
            {
                auto item = m_sendMessages.dequeue();
                if (item)
                {
                    // Destructure and send
                    auto& [clientId, message] = item.value();

                    std::lock_guard<std::mutex> lock(m_mutexSockets);
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
                    m_sockets[clientId]->send(static_cast<void*>(serialized.data()), serialized.size());
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

    void MessageQueueServer::initializeReceiver()
    {
        m_threadReceiver = std::thread([this]() {
            while (m_keepRunning)
            {
                if (m_selector.wait(sf::seconds(1.0f)))
                {
                    // Have to iterate through all of them to find out which one(s) are ready
                    for (auto& [clientId, socket] : m_sockets)
                    {
                        if (m_selector.isReady(*socket))
                        {
                            std::array<std::uint8_t, 5> header;
                            std::size_t received;
                            if (socket->receive(header.data(), 5, received) == sf::Socket::Done)
                            {
                            }
                        }
                    }
                }
            }
        });
    }

} // namespace messages
