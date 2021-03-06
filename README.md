# Virgil

## Self-Hosting Instructions

### Windows

1. Download the <a href="https://nodejs.org/en/download/current/">current release</a> of NodeJS.
2. Download the <a href="https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16">Visual Studio Build Tools Installer</a>.
3. Install NodeJS and the Build Tools with the C/C++ toolchain.
4. Navigate into the repo folder and install the node modules: `npm i`
5. To ensure the bot stays online, a process manager such as PM2 will be handy.
6. To enable music, read the ffmpeg compilation guide at the bottom.
7. Run `node setup.js` and follow the prompts.
8. Start the bot: `npm start`

### Linux

This guide assumes you are using Ubuntu or another Debian based distro)

1. Install the current release of NodeJS by <a href="https://github.com/nodejs/node/blob/master/BUILDING.md#building-nodejs-on-supported-platforms">building from source</a> or <a href="https://nodejs.org/en/download/package-manager/">adding the repo to your package manager</a>.<br/>Note: There have been various issues when intalling via the snap store, it is not recommended to install node from there.
2. Install the necessary build tools: `sudo apt install gcc g++ make`
3. Install ffmpeg: `sudo apt install ffmpeg` or `sudo snap install ffmpeg` (Note: Do not use ffmpeg on node v15.5.0, see common errors #4).
4. Create the user: `sudo adduser --system --disabled-login --group virgil`
5. Switch to home: `cd /home/virgil`
6. Clone the repo: `sudo -u virgil git clone https://github.com/Wolftallemo/Virgil ./`
7. Install the modules: `sudo -u virgil npm i`
8. Run `node setup.js` and add the credentials.
9. Create a systemd service to ensure the bot stays online, a sample service is provided below:
   ```
   [Unit]
   Description=Virgil systemd service
   Documentation=https://github.com/Wolftallemo/Virgil/blob/main/README.md
   After=network.target
   
   [Service]
   Type=simple
   User=virgil
   WorkingDirectory=/home/virgil
   ExecStart=/usr/bin/node ./index.js
   Restart=on-failure
   
   [Install]
   WantedBy=multi-user.target
   ```
   
10. Enable the service: `sudo systemctl start virgil`

If the bot is not online, check the logs with `sudo journalctl -eu virgil`

## Config Options
```
"token": The bot token needed to log in to discord.
"prefix": Please tell me this is obvious.
"gameModeratorUsers": Array of user IDs which can execute game mod commands (roles array takes precedence).
"bucket": Ban files are uploaded to this bucket.
"serviceKeyPath": Full path of service key for google cloud.
"appealsManagerRole": Array of roles that are allowed to execute the appeals commands.
"databaseAddress": Hostname/IP address of database.
"databaseUser": Username of connecting user.
"databasePassword": Password of database user (socketed connections currently not supported).
"databaseName": Name of database to connect to.
```

## Common Errors
1. NPM install errors: Visual Studio Build Tools 2017 or later is required to build certain modules. You can download it <a href="https://download.visualstudio.microsoft.com/download/pr/9b3476ff-6d0a-4ff8-956d-270147f21cd4/ccfb9355f4f753315455542f966025f96de734292d3908c8c3717e9685b709f0/vs_BuildTools.exe">here</a>. On linux, `gcc`, `g++`, `make`, and `python3` must be installed (if you get a `distutils` error, install `python3-distutils`).
2. Mailgun authentication issues: Do not base64 encode your api key, this will be done automatically. Otherwise, ensure you typed it in correctly and you aren't using a sandbox domain.
3. Database connection issues: Did you enter the correct information, if so, make sure any firewall you may have set up isn't blocking connections.
4. `ECONNRESET` when playing 5+ minute long songs: Node v15.5.0 seems to be problematic with music playback (update to v15.6.0+).

## Compiling FFmpeg (Windows)
1. Download and install <a href="https://www.msys2.org">MSYS2</a>
2. Open an elevated command prompt or powershell window and run `choco install yasm`
3. Open x64 Native Tools Command Prompt for VS 20XX
4. Run `C:\msys64\msys2_shell.cmd` in the command prompt
5. Add `cl.exe` to PATH: `export PATH=/c/ProgramData/chocolatey/bin:"/c/Program Files (x86)/Microsoft Visual Studio/20XX/BuildTools/VC/Tools/MSVC/{version}/bin/Hostx64/x64":$PATH` (Substitute the year number and MSVC version)
6. Install the necessary packages: `pacman -S diffutils yasm git make pkg-config`
7. Clone the FFmpeg repo: `git clone https://git.ffmpeg.org/ffmpeg.git && cd ffmpeg`
8. `./configure --toolchain=msvc --arch=x86_64 --target-os=win64` - Note: This step is painfully slow on MSYS2
9. `make` (You can always run more or less jobs if you wish)
10. When compilation completes, open `C:\msys64\home\yourname\ffmpeg` and drag `ffmpeg.exe` into `C:\Windows`
11. Run `ffmpeg` in command prompt to make sure it works.
