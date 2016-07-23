# Tile Rendering Demo

This sample demonstrates rendering of a background image using a tile-based approach.
---
![Tile Rendering Sample](https://github.com/ProfPorkins/GameTech/blob/master/JavaScript/TileRendering/Tile-Rendering.png "")
---

In order to use this sample, an image from the NASA Hubble Space Telescope site must be downloaded and prepared.  Use the following instructions to prepare the image:

1. Download and install [ImageMagick](http://www.imagemagick.org/script/index.php)
2. Open a Windows Powershell
3. Navigate to the \TileRendering\assets\graphics\background folder.
4. Enter the following commands to download the image:
   * `$url = "https://cdn.spacetelescope.org/archives/images/large/heic0910e.jpg"`
   * `$output = "heic0910e.jpg"`
   * `Import-Module BitsTransfer`
   * `Start-BitsTransfer -Source $url -Destination $output`
5. Use ImageMagick to crop the image to the necessary dimensions, converting to a png format while doing so.
   * `magick convert heic0910e.jpg -crop 4480x2560+0+0 +repage cropped.png`
6. Using ImageMagick to generate the image tiles.
   * `magick convert cropped.png -crop 128x128 +repage +adjoin tiles%03d.png`

With the image tiles created, the sample can be run.  It must be run as a server: `node server.js`.  With the server running, connect to: `http://localhost:3000`


## Content Acknowledgements

* Use of *playerShip1_blue.png* under Creative Commons License
  * Source: http://www.kenney.nl
* NASA Hubble Image
  * Source: https://www.spacetelescope.org/images/heic0910e/
  * Credit: NASA, ESA and the Hubble SM4 ERO Team
