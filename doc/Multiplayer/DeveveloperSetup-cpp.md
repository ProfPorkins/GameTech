# C++ Developer Setup & Compiling Instructions

This page describes how to setup the development environment you need to compile and run the C++ multiplayer examples.  Instructions for both Windows and Linux are provided.  Familiarity with C++ development on either Windows or Linux.

## Windows

The following development tools must be installed:

* Visual Studio 2019
* git
* CMake

The multiplayer examples use Google's Protocol Buffers (version 3) for serialization/deserialization of data for network transport.  This link, [Protocol Buffers](https://github.com/protocolbuffers/protobuf/blob/master/src/README.md), provides instructions for installation.  I recommend the following steps:

1. (todo) do something first
1. (todo) do something else second

viola, they are installed and ready to use

The next step is to clone and build the multiplayer examples.  The following steps can be used to do this.

1. Clone the Game Techniques repository.  You can either so this using a command line or a tool with a GUI.  I personally use GitExtensions, but do most things from the command line inside of it.  The repository is located at: https://github.com/ProfPorkins/GameTech.git
1. Using initialize the submodules: `git submodule update --init --recursive`
1. Run the CMake GUI
   1. For the **Where is the source code** field navigate to the example you want to build.  For example **Step 1 - Basic**
   1. For the **Where to build the binaries** use the same pathname from above, but add a `/build` folder to it.
   1. Press the **Configure** button.
   1. Press it again...because they decided that is a good idea.
   1. Press the **Generate** button.
1. Navigate to the `/build` folder
1. Double-click on the `Multiplayer-Step1-Basic.sln` file.  Alternatively start Visual Studio and open this solution file.
1. Open the context menu (usually right-mouse click) over **Client** and set it as the startup project.
1. Build the solution.
1. Inside the `build/Debug` folder, run `Server.exe`
1. From within Visual Studio, run the **Client** project.
1. Enjoy!

If you want to run the `Client.exe` directly from the Debug or Release folders, copy the `client/assets` folder to the `/build/Debug` folder.  Then run the `Client.exe` program.

## Linux

I am working on an Ubuntu installation.  Therefore these instructions are based on that platform.  Other Linux distributions may require different steps, especially those not Debian based and without the apt package manager.

The following development tools must be installed:

* git
* g++ - A version that supports C++ 17 is required
* CMake
* (optional) clang-format
* The following may need to be installed: `sudo apt install ...`
  * libx11-dev
  * xorg-dev
  * opengl
  * libgl1-mesa-dev
  * libopenal-dev
  * libvorbis-dev
  * libflac-dev
  * libudev-dev

The multiplayer examples use Google's Protocol Buffers (version 3) for serialization/deserialization of data for network transport.  This link, [Protocol Buffers](https://github.com/protocolbuffers/protobuf/blob/master/src/README.md), provides instructions for installation.  I recommend the following steps:

1. Install the necessary tools: `sudo apt-get install autoconf automake libtool curl make g++ unzip`
1. Create a protobuf subdirectory in a location of your choosing.
1. Clone the git repository: `git clone https://github.com/protocolbuffers/protobuf.git`
1. Initialize the submodules: `git submodule update --init --recursive`
1. Run autogen.sh: `./autogen.sh`
1. Configure, build and install
   1. `./configure --prefix=/usr`
   1. `make`
   1. `make check`
   1. `sudo make install`
   1. `sudo ldconfig`

The next step is to clone and build the multiplayer examples.  The following steps can be used to do this.

1. Clone the Game Techniques repository: `git clone https://github.com/ProfPorkins/GameTech.git`
1. Initialize the submodules: `git submodule update --init --recursive`
1. Choose which example you want to build and navigate into that folder.  For example:
   1. `cd C++`
   1. `cd "Step 1 - Basic"`
1. Once in the example folder, create a sub-folder named 'build': `mkdir build`
1. Navigate into this folder: `cd build`
1. Use CMake to create the makefiles: `cmake ..`
1. Once CMake has completed, use make to build the example: `make`
1. Copy the `client/assets` folder to the `/build` folder.  _I know, I need to update the CMake code to do this_
1. Start the Server executable: `./Server`
1. Start the Client executable (in a different terminal): `./Client`
1. Enjoy!
