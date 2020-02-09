#pragma once

#include <mutex>
#include <optional>
#include <queue>

// ------------------------------------------------------------------
//
// @details This is a fairly simple concurrent queue that allows thread
// safe access.
//
// ------------------------------------------------------------------
template <typename T>
class ConcurrentQueue
{
  public:
    // ------------------------------------------------------------------
    //
    // Enqueues a new item onto the queue
    //
    // ------------------------------------------------------------------
    void enqueue(const T& item)
    {
        std::lock_guard<std::mutex> lock(m_mutex);

        m_queue.push(item);
    }

    // ------------------------------------------------------------------
    //
    // Attempts to dequeue an item.  An std::optional is use to return
    // the value, allowing the client code to know whether or not a
    // value was available.
    //
    // ------------------------------------------------------------------
    std::optional<T> dequeue()
    {
        std::lock_guard<std::mutex> lock(m_mutex);

        if (!m_queue.empty())
        {
            auto item = m_queue.front();
            m_queue.pop();
            return item;
        }

        return std::nullopt;
    }

  private:
    std::queue<T> m_queue;
    std::mutex m_mutex;
};
