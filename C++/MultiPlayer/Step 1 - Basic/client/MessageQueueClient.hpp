#pragma once

#include "ConcurrentQueue.hpp"
#include "messages/Message.hpp"

#include <SFML/Network.hpp>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>
#include <unordered_map>

namespace messages
{
    class MessageQueueClient
    {
      public:
        bool initialize(std::string serverIP, std::uint16_t serverPort);

        std::queue<std::shared_ptr<Message>> getMessages();

      private:
        bool m_keepRunning{true};
        sf::SocketSelector m_selector;
        std::unique_ptr<sf::TcpSocket> m_socketServer;

        std::thread m_threadSender;
        ConcurrentQueue<std::shared_ptr<Message>> m_sendMessages;
        std::mutex m_mutexSendMessages;
        std::condition_variable m_eventSendMessages;
        std::mutex m_mutexEventSendMessages;

        std::thread m_threadReceiver;
        std::unordered_map<messages::Type, std::function<std::shared_ptr<messages::Message>(void)>> m_messageCommand;
        std::queue<std::shared_ptr<Message>> m_receivedMessages;
        std::mutex m_mutexReceivedMessages;

        void initializeSender();
        void initializeReceiver();
    };
} // namespace messages
