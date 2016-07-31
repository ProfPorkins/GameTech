# Simple Game Demo
This sample demonstrates the gameplay of a basic game; it does not include menus, high-scores, etc., just the gameplay.

---
*...A screenshot will eventually show up here...*
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

* Use of *spaceshooter* assets under Creative Commons License.  Thank you very much!!
  * Source: http://www.kenney.nl
* Use of *fire.png* under the Microsoft Permissive License
  * Source: http://xbox.create.msdn.com/en-US/education/catalog/sample/particle_3d
* NASA Hubble Image
  * Source: https://www.spacetelescope.org/images/heic0910e/
  * Credit: NASA, ESA and the Hubble SM4 ERO Team
