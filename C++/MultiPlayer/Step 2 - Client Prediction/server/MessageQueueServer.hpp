#pragma once

#include "ConcurrentQueue.hpp"
#include "messages/Message.hpp"

#include <SFML/Network.hpp>
#include <condition_variable>
#include <cstdint>
#include <functional>
#include <memory>
#include <mutex>
#include <optional>
#include <queue>
#include <thread>
#include <tuple>
#include <unordered_map>
#include <unordered_set>

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
    void registerConnectHandler(std::function<void(std::uint64_t)> handler) { m_connectHandler = handler; }
    void registerDisconnectHandler(std::function<void(std::uint64_t)> handler) { m_disconnectHandler = handler; }

    void sendMessage(std::uint64_t clientId, std::shared_ptr<messages::Message> message, std::optional<std::uint32_t> messageId = std::nullopt);
    void sendMessageWithLastId(std::uint64_t clientId, std::shared_ptr<messages::Message>& message);
    void broadcastMessage(std::shared_ptr<messages::Message> message);
    void broadcastMessageWithLastId(std::shared_ptr<messages::Message> message);
    std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> getMessages();

  private:
    MessageQueueServer() {}

    bool m_keepRunning{true};
    std::thread m_threadListener;
    std::thread m_threadSender;
    std::thread m_threadReceiver;
    std::unordered_map<messages::Type, std::function<std::shared_ptr<messages::Message>(void)>> m_messageCommand;

    ConcurrentQueue<std::tuple<std::uint64_t, std::optional<std::uint32_t>, std::shared_ptr<messages::Message>>> m_sendMessages;
    std::condition_variable m_eventSendMessages;
    std::mutex m_mutexEventSendMessages;

    std::queue<std::tuple<std::uint64_t, std::shared_ptr<messages::Message>>> m_receivedMessages;
    std::mutex m_mutexReceivedMessages;
    std::unordered_map<std::uint64_t, std::uint32_t> m_clientLastMessageId;

    sf::SocketSelector m_selector;
    sf::TcpListener m_listener;
    std::function<void(std::uint64_t)> m_connectHandler;
    std::function<void(std::uint64_t)> m_disconnectHandler;
    std::unordered_map<std::uint64_t, std::unique_ptr<sf::TcpSocket>> m_sockets;
    std::unique_ptr<sf::TcpSocket> m_socketServer;
    std::mutex m_mutexSockets;

    std::uint64_t socketToId(sf::TcpSocket* socket);
    void initializeListener(std::uint16_t listenPort);
    void initializeSender();
    void initializeReceiver();
    void removeDisconnected(std::unordered_set<std::uint64_t>& removeThese);
};
