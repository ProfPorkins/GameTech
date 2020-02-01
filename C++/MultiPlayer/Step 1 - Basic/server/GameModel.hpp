#pragma once

#include <chrono>
#include <memory>
#include <unordered_set>

class GameModel
{
  public:
    void update(const std::chrono::milliseconds elapsedTime);

  private:
};
