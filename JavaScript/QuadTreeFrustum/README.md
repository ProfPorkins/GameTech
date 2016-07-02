# 2D QuadTree - Frustum Culling
The sample can be run by opening index.html in a browser.

Notes about the demo:

* To see the primary benefit of the frustum culling, do the following:
 1. Disable movement
 2. Disable rendering of the entities
 3. Disable rendering of the quad-tree
 4. Add several thousand entities (2 or 3 thousand should be enough).  Notice the frame-rate in the upper right corner.
 5. Move the camera around to see the frustum culling in action.
 6. Enable the rendering of entities.  Notice the frame-rate has now dropped.
 7. Move the camera around and enjoy the display.

* When movement of the entities is enabled, a quad-tree is rebuilt every frame.  This begins to have an impact on frame-rate after several hundred entities are moving around.  When movement is disabled, the quad-tree doesn't have to be rebuilt each frame, making a big performance improvement with large numbers of entities.
* Rendering of the entities begins to impact performance after a several hundred.

----
##Camera Movement
* w - Move camera forward
* s - Move camera backward
* a - Rotate camera left
* d - Rotate camera right

----
##Viewing Frustum
* i - Increase viewing distance
* k - Decrease viewing distance
* j - Decrease field of view
* l - Increase field of view

----
##Rendering
* q - Toggle quad-tree rendering
* e - Toggle entity (circles) rendering

----
##Other
* Page Up - Add 10 entities
* Page Down - Remove 10 entities
* Up Arrow - Increase quad-tree node splitting criteria
* Down Arrow - Decrease quad-tree node splitting criteria
* m - Toggle movement of the entities
* mouse-click on browser window toggles full-screen display


---
![Frustum Culling Sample](https://github.com/ProfPorkins/GameTech/blob/QuadTreeFrustum/JavaScript/QuadTreeFrustum/QuadTree-FrustumCulling.png "")

