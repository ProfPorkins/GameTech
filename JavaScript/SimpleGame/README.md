# Simple Game Demo
This sample demonstrates the gameplay of a basic game; it does not include menus, high-scores, etc., just the gameplay.

When I was originally working on these demos and the simple game, I was interrupted by a completely separate, and extremely large, side-project that lasted several years.  That project is now complete.  However, I have decided to not return to make any significant revisions to this game.  Only spent enough time to make a few modest code revisions in order to wrap up where I left off.  Even though I'm not finishing what I originally intended, there is quite a bit in it, probably meeting about 75% of my original intention.

There are a bunch more sample game techniques (JavaScript & C++) I'll be working on now, and plan to eventually get a new "simple game" added to this repository.

---
![Simple Game Demo](https://github.com/ProfPorkins/GameTech/blob/master/JavaScript/SimpleGame/SimpleGame.png "")
---

In order to use this sample, an image from the NASA Hubble Space Telescope site must be downloaded and prepared.  Use the following instructions to prepare the image:

1. Download and install [ImageMagick](http://www.imagemagick.org/script/index.php).  Linux systems likely already have this installed.
2. For Windows
   1. Open a Windows Powershell
   2. Navigate to the \TileRendering\assets\graphics\background folder; you might have to create the 'background' folder.
   3. Enter the following commands to download the image:
      * `$url = "https://cdn.spacetelescope.org/archives/images/large/heic0910e.jpg"`
      * `$output = "heic0910e.jpg"`
      * `Import-Module BitsTransfer`
      * `Start-BitsTransfer -Source $url -Destination $output`
   4. Use ImageMagick to crop the image to the necessary dimensions.
      * `magick convert heic0910e.jpg -crop 4480x2560+0+0 +repage cropped.jpg`
   5. Using ImageMagick to generate the image tiles.
      * `magick convert cropped.jpg -crop 128x128 +repage +adjoin tiles%04d.jpg`
3. For Linux
   1. Open a terminal
   2. Navigate to the \TileRendering\assets\graphics\background folder; you might have to create the 'background' folder.
   3. Enter the following command to download the image:
      * `wget https://cdn.spacetelescope.org/archives/images/large/heic0910e.jpg`
   4. Use ImageMagick to crop the image to the necessary dimensions.
      * `convert heic0910e.jpg -crop 4480x2560+0+0 +repage cropped.jpg`
   5. Using ImageMagick to generate the image tiles.
      * `convert cropped.jpg -crop 128x128 +repage +adjoin tiles%04d.jpg`

With the image tiles created, the sample game can be run.  It must be run as a server: `node server.js`.  With the server running, connect to: `http://localhost:3000`

## Content Acknowledgements

Thanks all sources for the great assets!

* Use of *spaceshooter* assets under Creative Commons License.
  * Source: http://www.kenney.nl
  * License: http://creativecommons.org/publicdomain/zero/1.0/
* Adapted use of *fireball* under Public Domain.
  * Source: http://opengameart.org/content/sparkling-fireball-effect
* Use of *fire.png* under the Microsoft Permissive License
  * Source: http://xbox.create.msdn.com/en-US/education/catalog/sample/particle_3d
* NASA Hubble Image
  * Source: https://www.spacetelescope.org/images/heic0910e/
  * Credit: NASA, ESA and the Hubble SM4 ERO Team
* Use of *explosion_01* under Creative Commons License.
  * Source: https://www.freesound.org/people/tommccann/sounds/235968
  * License: https://creativecommons.org/publicdomain/zero/1.0/
* Use of *hvylas* under Creative Commons Sampling Plus 1.0
  * Source: https://www.freesound.org/people/inferno/sounds/18382/
  * License: https://creativecommons.org/licenses/sampling+/1.0/
* Use of *LaserShotSilenced* under Creative Commons License.
  * Source: https://www.freesound.org/people/bubaproducer/sounds/151022/
  * License: https://creativecommons.org/licenses/by/3.0/
* Use of *ProjectileHit* under Creative Commons License.
  * Source: https://www.freesound.org/people/unfa/sounds/193429/
  * License: https://creativecommons.org/licenses/by/3.0/
* Use of *ThrusterLevel3* under Creative Commons Sampling Plus 1.0
  * Source: https://www.freesound.org/people/nathanshadow/sounds/22456/
  * License: https://creativecommons.org/licenses/sampling+/1.0/
* Use of *The Lift* under Creative Commons
  * Credit: Kevin MacLeod (incompetech.com)
  * Source: http://incompetech.com
  * License: https://creativecommons.org/licenses/by/3.0/
