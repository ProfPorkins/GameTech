#include "AnimatedSprite.hpp"

namespace components
{
    void AnimatedSprite::update(std::chrono::microseconds elapsedTime)
    {
        m_elapsedTime += elapsedTime;
        //
        // Check to see if we have expired the current sprite time and need to
        // move to the next sprite.
        if (m_elapsedTime >= std::chrono::duration_cast<std::chrono::microseconds>(m_spriteTime[m_currentSprite]))
        {
            //
            // Keep the leftover time
            m_elapsedTime -= std::chrono::duration_cast<std::chrono::microseconds>(m_spriteTime[m_currentSprite]);
            //
            // Update to next sprite, wrapping around if necessary
            m_currentSprite++;
            m_currentSprite = m_currentSprite % m_spriteTime.size();
        }
    }
} // namespace components
