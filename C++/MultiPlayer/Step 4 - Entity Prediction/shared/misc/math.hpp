#pragma once

// --------------------------------------------------------------
//
// Right now just a grab bag of misc code that doesn't belong
// anywhere else.  In fact, just one thing at this time.
//
// --------------------------------------------------------------

namespace math
{
    struct Vector2f
    {
        Vector2f() :
            x(0), y(0)
        {
        }

        Vector2f(float x, float y) :
            x(x), y(y)
        {
        }

        float x;
        float y;
    };
} // namespace math
