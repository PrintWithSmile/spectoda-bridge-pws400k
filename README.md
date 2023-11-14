# spectoda-bridge-pws400k

spectoda-bridge-pws400k is a "bridge" that enables communication with Spectoda devices using Serial or Bluetooth and provides a REST API for accessing their functionalities.

## How to install on the PWS400K Orange Pi

0. follow the instructions for installing moonraker-spectoda-connector

### Linux settings

1. Enable ttyS0 (UART0) in the OrangePi system settings

### Moonraker configuration 

2. Clone https://github.com/Spectoda/spectoda-bridge-pws400k repository to the pi directory using:
``` 
cd ~
git clone https://github.com/Spectoda/spectoda-bridge-pws400k 
cd spectoda-bridge-pws400k
git submodule update --init --recursive
```
3. Install npm dependencies in spectoda-bridge-pws400k `npm i`
4. Update printer_data/moonraker.asvc to include `spectoda-bridge-pws400k`
5. Update printer_data/config/moonraker.conf to include 
```
[notifier spectoda]
url: json://localhost:8888/notifier
events: gcode
body: {event_message}

[update_manager spectoda-bridge-pws400k]
type: git_repo
path: ~/spectoda-bridge-pws400k
origin: https://github.com/Spectoda/spectoda-bridge-pws400k.git
primary_branch: release
enable_node_updates: True
managed_services:
    spectoda-bridge-pws400k
```
6. Setup service file `/etc/systemd/system/spectoda-bridge-pws400k.service` like so:
```
[Unit]
Description=Bridge for connecting to Spectoda Ecosystem
After=network.target

[Service]
User=pi
Group=pi
WorkingDirectory=/home/pi/spectoda-bridge-pws400k
ExecStart=npm start
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=default.target
```
7. Start the spectoda-bridge-pws400k.service service using `sudo systemctl start spectoda-bridge-pws400k`

### Connect Controller and try it out

8. Connect Spectoda Controller with FW version 0.10 and try it out. The Controller should have enabled `"serial"` on `"tx": 27` and `"rx": 26` in its config (by default) like so:
```
{
  "controller": {
    "label": "p400k",
    "name": "AA23000",
    "power": 255,
    "led": 13
  },
  "serial": {
    "tx": 27,
    "rx": 26,
    "baudrate": 115200
  },
  "espnow": {
    "disable": true
  },
  "ports": [
    {
      "tag": "A",
      "type": "WS2812B",
      "pin": 16,
      "size": 25
    },
    {
      "tag": "B",
      "type": "WS2812B",
      "pin": 5,
      "size": 22,
      "reversed": false
    },
    {
      "tag": "C",
      "type": "WS2812B",
      "pin": 17,
      "size": 43
    }
  ],
  "providers": [
    {
      "type": "Button",
      "label": "toggl",
      "pin": 14
    }
  ]
}
```
9. Look for possible issues with `sudo journalctl -u spectoda-bridge-pws400k.service -f`

The service must be run under root, or it will not have rights to use the UART0
