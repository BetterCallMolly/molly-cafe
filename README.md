# Molly's Cafe 🍵

This repo contains the source code for [Molly's Cafe](https://mana.rip/), a work in progress neocity / portfolio !

Here's a list of all the features that are currently implemented :

- [x] Real-time monitoring of the server
    - Docker containers
    - Systemd services
    - CPU temperature
    - TCP / UDP connections
    - Dirty memory
    - Opened file descriptors
    - Running processes
    - Idle Uptime
    - RAM usage
    - Free disk space
- [x] List of my school projects (with live updates)
- [x] Pistache (my blogging engine) posts (with live updates)
- [x] Real-time Paris weather with dynamic background (clouds, rain, ...) and the following informations :
    - Sunrise
    - Sunset
    - Local time
    - Cloudiness
    - Felt temperature
    - Humidity
    - Wind speed
- [x] Cursor of other users (opt-out through a small checkbox)
- [x] Currently listening on [Strawberry Player](https://www.strawberrymusicplayer.org/)
- [x] Number of users currently connected
- [x] Live progress of a [Leitner System](https://en.wikipedia.org/wiki/Leitner_system)
- [x] Sleep tracking (through Apple's [Shortcuts app](https://apps.apple.com/us/app/shortcuts/id915249334))
- [x] Template rendering for the front-end

# Note

## Platform support

The Go code can only be compiled on Linux (maybe MacOS ?) due to :

1. The usage of Go's `syscall` package
2. The usage of a lot of `/proc` / `/sys` file parsing
3. Relying on `systemd` for service management

## Looking for bugs ?

Go ahead, break everything you can (well not too much), I'll be happy to fix it and learn more!

# Exploring the code

If you're interested in some specific part of the code, here's a simple table of content :

- [Netcode](#netcode)
- [Monitoring](#monitoring)
- [2D Rendering](#2d-rendering)

## Netcode <a name="netcode"></a>

The netcode is the part of the code that handles (for the moment) the websocket connections.

- [clients.go](server/socket/clients.go) : Handles connections and handles broadcasting / mutexes
- [proto.go](server/socket/proto.go) : Creation, modification of custom packets
- [packets.go](server/socket/packets.go) : Hashmap of packets, used by watchdogs to quickly edit packets and reflect the changes to the clients
- [main.go](server/main.go) : Handling of HTTP -> Websocket upgrade, along with other private APIs and static file serving

## Monitoring <a name="monitoring"></a>

The monitoring part of the code is where the program is gathering data from other programs / from the kernel.

### Services

The `services` part of the code, is where we gather the state of specific services running through `systemd`, and where we gather the state of `docker` containers.

This part of the code is completely done using polling, so I made the choice of also making it real-time, meaning that any change to a `docker` container or a `systemd` service will be broadcasted instantly.

### Watchdogs

Currently each `watchdog` is a goroutine, and each `watchdog` is started in the `init` function.

A `watchdog` is a goroutine that will poll a specific value, and if the value is different from the previous one, it will update the corresponding packet, and broadcast it to the clients, and then sleep for a specific amount of time.


| File | Description | Remarks |
| :--- | :--- | --- |
| [Containers.go](server/watchdogs/Containers.go) | Watches every `docker` containers | - |
| [CPUTemp.go](server/watchdogs/CPUTemp.go) | Watches the CPU temperature (compatible with `k10temp` / `coretemp`) | - |
| [DirtyMem.go](server/watchdogs/DirtyMem.go) | Watches the amount of dirty memory | - |
| [DiskSpace.go](server/watchdogs/DiskSpace.go) | Watches the amount of free disk space | - |
| [IdleUptime.go](server/watchdogs/IdleUptime.go) | Watches the amount of time the system has been idle | - |
| [InternetSpeed.go](server/watchdogs/InternetSpeed.go) | Downloads a file every hour and measure download speed | Probably cycle through multiple servers to be a good netizen |
| [LoggedUsers.go](server/watchdogs/LoggedUsers.go) | Watches the amount of logged users | Disabled for now, because I don't want to fork `who`, and must parse `/var/run/wtmp` instead |
| [ManualService.go](server/watchdogs/ManualService.go) | Watches the state of a `systemd` service | - |
| [MemUsage.go](server/watchdogs/MemUsage.go) | Watches the amount of memory used | - |
| [MonitorSchoolProjects.go](server/watchdogs/MonitorSchoolProjects.go) | Polls a directory containing school projects to dynamically update a table in the front-end | - |
| [OpenFiles.go](server/watchdogs/OpenFiles.go) | Watches the amount of opened fds | - |
| [PistachePosts.go](server/watchdogs/PistachePosts.go) | Polls a directory containing posts to dynamically update a list of blog-post in the front-end | - |
| [RunningProcesses.go](server/watchdogs/RunningProcesses.go) | Watches the amount of running processes | - |
| [TcpUdp.go](server/watchdogs/TcpUdp.go) | Watches the amount of opened TCP / UDP sockets | - |
| [Weather.go](server/watchdogs/Weather.go) | Checks the weather of any configured city every 5 minutes | - |

#### Implementation notes

They're designed to be as simple, efficient and modular as possible (for my use case).

Docker containers states are watched through [docker events](https://docs.docker.com/engine/api/v1.43/#tag/System/operation/SystemEvents).

`systemd` services states are watched through a probably overthought method using `inotify` on the `/run/systemd/units` directory.

## 2D Rendering <a name="2d-rendering"></a>

The 2D rendering part of the code is done using just a HTML5 canvas, and a handmade 2D rendering engine called Sirius.

You can display its debugging side-card on the front-end by changing the `sirius_debug` local storage value to `true` through the browser's devtools, and then reloading the page.

Or you can run this JavaScript code in the console :

```js
localStorage.setItem("sirius_debug", "true");
window.location.reload();
```

__NOTE__: to disable it, just set the `sirius_debug` local storage value to `false` and reload the page.

### Sirius

Sirius is a **very** basic object-oriented 2D rendering engine. It contains only the bare minimum to be able to render a 2D scene, with very basic physics, as always, I have a lot of ideas to improve it for future ideas.

You can see the entire source code of the engine [here](front/src/sirius/)

#### Features

- [x] Static 2D rendering
- [x] Moving 2D rendering (basic physics)
- [x] Click events
- [ ] Particles
- [ ] Animations
- [ ] Advanced physics

#### ADrawable

You can create a drawable object by creating extending the `ADrawable` class, and implementing the `tick` method.

The `tick` method is called every frame whether the object is enabled or not.

#### AMovable

An `AMovable` is an `ADrawable` that can move, it has a `velocity`, every frame, the `velocity` is added to the `position` of the object.


# Credits

Thanks to [Miko](https://x.com/Miko_Shiy) for most of the graphics !

## Assets

| File | Usage | Author |
| :--- | :--- | --- |
| `cloud_0.png` | Cloud variant 0 | Miko |
| `cloud_1.png` | Cloud variant 1 | Miko |
| `cloud_2.png` | Cloud variant 2 | Miko |
| `cloud_3.png` | Cloud variant 3 | Miko |
| `cloud_4.png` | Cloud variant 4 | Miko |
| `cloud_icon.png` | Cloudiness icon | Miko |
| `cursor.png` | Other user's cursors | ? |
| `moon.png` | Moon icon for sunset time | Miko |
| `placeholder.png` | Placeholder | Molly |
| `raindrop_0.png` | Raindrop | Molly |
| `sun.png` | Sun icon for sunrise time | Miko |
| `clock.png` | Clock icon to display current time | Miko |
| `thermometer.png` | Thermometer icon to display felt temperature | Miko |
| `humidity.png` | Humidity icon to display humidity | Miko |
| `wind.png` | Wind icon to display wind speed | Miko |