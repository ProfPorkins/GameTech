# 2D QuadTree
The sample can be run by opening `index.html` in a browser.

---
![Frustum Culling Sample](https://github.com/ProfPorkins/GameTech/blob/master/JavaScript/QuadTree/QuadTree.png "")
---

A few notes about the demo...

* When movement of the entities is enabled, a quad-tree is rebuilt every frame.  This begins to have an impact on frame-rate after several hundred entities are moving around.  When movement is disabled, the quad-tree doesn't have to be rebuilt each frame, making a big performance improvement with large numbers of entities.
* Rendering of the entities begins to impact performance after a several hundred.
* I have found Chrome and IE to be quite a bit faster than Firefox, especially when building the quad-tree.
* The Edge browser flashes between each animation frame.  I haven't investigated this yet, not sure when I will.

----

The demo can be controlled by the following...

## General
* q - Toggle quad-tree rendering
* e - Toggle entity (circles) rendering
* Page Up - Add 10 entities
* Page Down - Remove 10 entities
* Up Arrow - Increase quad-tree node splitting criteria
* Down Arrow - Decrease quad-tree node splitting criteria
* m - Toggle movement of the entities
* mouse-click on browser window toggles full-screen display
