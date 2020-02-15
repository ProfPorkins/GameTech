#pragma once

#include "ConcurrentQueue.hpp"
#include "messages/Message.hpp"

#include <SFML/Network.hpp>
#include <condition_variable>
#include <cstdint>
#include <functional>
#include <memory>
#include <mutex>
#include <queue>
#include <thread>
#include <tuple>
#include <unordered_map>

// --------------------------------------------------------------
//
// This provides the network message communication for the server.
// All connections and messages to and from clients are served here.
//
// Note: This is a Singleton
//
// --------------------------------------------------------------
class MessageQueueServer
{
  public:
    MessageQueueServer(const MessageQueueServer&) = delete;
    MessageQueueServer(MessageQueueServer&&) = delete;
    MessageQueueServer& operator=(const MessageQueueServer&) = delete;
    MessageQueueServer& operator=(MessageQueueServer&&) = delete;

    static auto& instance()
    {
        static MessageQueueServer instance;
        return instance;
    }

    bool initialize(std::uint16_t listenPort);
    void shutdown();
    void onClientConnected(std::function<void(sf::Uint32)> onClientConnected) { m_onClientConnected = onClientConnected; }

    void sendMessage(sf::Uint32 clientId, std::shared_ptr<messages::Message> message);
    std::queue<std::tuple<std::uint32_t, std::shared_ptr<messages::Message>>> getMessages();

  private:
    MessageQueueServer() {}

    bool m_keepRunning{true};
    std::thread m_threadListener;
    std::thread m_threadSender;
    std::thread m_threadReceiver;
    std::unordered_map<messages::Type, std::function<std::shared_ptr<messages::Message>(void)>> m_messageCommand;

    ConcurrentQueue<std::tuple<sf::Uint32, std::shared_ptr<messages::Message>>> m_sendMessages;
    std::condition_variable m_eventSendMessages;
    std::mutex m_mutexEventSendMessages;

    std::queue<std::tuple<std::uint32_t, std::shared_ptr<messages::Message>>> m_receivedMessages;
    std::mutex m_mutexReceivedMessages;

    sf::SocketSelector m_selector;
    sf::TcpListener m_listener;
    std::function<void(sf::Uint32)> m_onClientConnected;
    std::unordered_map<sf::Uint32, std::unique_ptr<sf::TcpSocket>> m_sockets;
    std::unique_ptr<sf::TcpSocket> m_socketServer;
    std::mutex m_mutexSockets;

    void initializeListener(std::uint16_t listenPort);
    void initializeSender();
    void initializeReceiver();
};
