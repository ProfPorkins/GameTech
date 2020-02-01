#include "GameModel.hpp"

// --------------------------------------------------------------
//
//
//
// --------------------------------------------------------------
void GameModel::update(const std::chrono::milliseconds elapsedTime)
{
}

void GameModel::clientConnected(std::unique_ptr<sf::TcpSocket> socket)
{
    std::lock_guard<std::mutex> lock(m_mutexSockets);
    if (m_sockets.find(socket->getRemoteAddress().toInteger()) != m_sockets.end())
    {
        m_sockets[socket->getRemoteAddress().toInteger()] = std::move(socket);
    }
}
