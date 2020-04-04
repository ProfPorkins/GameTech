#include "Animation.hpp"

namespace systems
{
    // --------------------------------------------------------------
    //
    // Update the state of the sprite based on elapsed time.
    //
    // --------------------------------------------------------------
    void Animation::update(std::chrono::microseconds elapsedTime, [[maybe_unused]] const std::chrono::system_clock::time_point now)
    {
        for (auto&& [id, entity] : m_entities)
        {
            (void)id; // unused
            auto sprite = entity->getComponent<components::AnimatedSprite>();
            sprite->updateElapsedTime(elapsedTime);
            //
            // Check to see if we have expired the current sprite time and need to
            // move to the next sprite.
            if (sprite->getElapsedTime() >= std::chrono::duration_cast<std::chrono::microseconds>(sprite->getCurrentSpriteTime()))
            {
                //
                // Keep the leftover time
                sprite->updateElapsedTime(-std::chrono::duration_cast<std::chrono::microseconds>(sprite->getCurrentSpriteTime()));
                //
                // Update to next sprite, wrapping around if necessary
                sprite->incrementSprite();
            }
        }
    }

} // namespace systems
