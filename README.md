# Pulse

<p align="center">
  <img src="public/favicon.svg" width="100" alt="Pulse Logo">
</p>

<h3 align="center">A blazing fast terminal emulator with glass aesthetics</h3>

<p align="center">
  Built with Rust + Tauri for native performance, React + TypeScript for modern UI,
  and GPU-accelerated rendering for smooth visuals.
</p>

---

## Features

### Glass Aesthetics
- Frosted glass window with real-time blur
- Noise texture overlay for depth
- Shimmer animation effects
- Customizable opacity (0-100%)
- Drop shadows with configurable intensity

### Multiplexing
- **Multiple tabs** - Run separate sessions in each tab
- **Split panes** - Divide terminals horizontally or vertically
- **Recursive splits** - Create complex layouts
- **Drag resize** - Adjust pane sizes with mouse

### Performance
- **GPU-accelerated** - WebGL text rendering via xterm.js
- **Native backend** - Rust PTY management with zero-copy I/O
- **120fps animations** - GPU-composited transitions
- **Low memory** - Tauri's minimal footprint

### Security Tools
- **Recon Sidebar** - Auto-extracts CVEs, ports, URLs, hostnames, JWTs, base64, credentials
- **Payload Palette** - Reverse shells, LFI/SSTI, encoding, enumeration, privesc payloads
- **Built-in Reverse Shell Handler** - TCP listener with connection management
- **Wordlist Integration** - RockYou, SecLists, DirBuster, Raft, WFuzz, and more
- **Variable Substitution** - LHOST/LPORT/TARGET placeholders auto-filled
- **Encoding Modes** - Raw, Base64, URL encoding on paste
- **Host Tagging** - Mark tabs as prod/staging/dev/ctf/homelab

### Customization
- **6 built-in themes** - Catppuccin, Dracula, Tokyo Night, Nord, Gruvbox
- **Full theme editor** - Colors, fonts, glass effects
- **Custom keybindings** - Terminator-compatible defaults
- **Live preview** - See changes before applying

## Screenshots

<p align="center">
  <em>Dark mode with Catppuccin Mocha theme</em>
</p>


## Installation

### Arch Linux

```bash
# Install dependencies
sudo pacman -S --needed curl git nodejs npm rust base-devel wget file webkit2gtk-4.1 gtk3 libayatana-appindicator librsvg openssl

# Install Pulse
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash
```

### Debian / Ubuntu

```bash
# Install dependencies
sudo apt install curl git nodejs npm rustc cargo build-essential libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev

# Option 1: Install script
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash

# Option 2: Binary download
wget https://github.com/0xClumzzy/pulse/releases/download/v1.0.0/pulse
chmod +x pulse
sudo mv pulse /usr/local/bin/pulse

# Option 3: .deb package
wget https://github.com/0xClumzzy/pulse/releases/download/v1.0.0/Pulse_1.0.0_amd64.deb
sudo dpkg -i Pulse_1.0.0_amd64.deb
```

### Fedora / RHEL

```bash
# Install dependencies
sudo dnf install curl git nodejs npm rust cargo webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel openssl-devel

# Option 1: Install script
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash

# Option 2: Binary download
wget https://github.com/0xClumzzy/pulse/releases/download/v1.0.0/pulse
chmod +x pulse
sudo mv pulse /usr/local/bin/pulse

# Option 3: .rpm package
wget https://github.com/0xClumzzy/pulse/releases/download/v1.0.0/Pulse-1.0.0-1.x86_64.rpm
sudo rpm -i Pulse-1.0.0-1.x86_64.rpm
```

### Other Distros

Build from source. See [docs/BUILDING.md](docs/BUILDING.md) for details.

### Uninstall

```bash
rm ~/.local/bin/pulse
```

## Documentation

| Document | Description |
|----------|-------------|
| [Installation](docs/INSTALL.md) | Platform-specific install guides |
| [Building](docs/BUILDING.md) | Build from source instructions |
| [Keybindings](docs/KEYBINDINGS.md) | Complete keyboard shortcut reference |
| [Themes](docs/THEMES.md) | Theme system and custom themes |
| [Configuration](docs/CONFIGURATION.md) | All configuration options |
| [Security Tools](docs/SECURITY.md) | Recon, payloads, and handler usage |
| [Contributing](CONTRIBUTING.md) | How to contribute |

## Keyboard Shortcuts

### Tabs
| Action | Shortcut |
|--------|----------|
| New Tab | `Ctrl+Shift+T` |
| Close Tab | `Ctrl+Shift+W` |
| Next Tab | `Ctrl+PageDown` |
| Previous Tab | `Ctrl+PageUp` |
| Go to Tab 1-9 | `Ctrl+Alt+1-9` |

### Split Panes
| Action | Shortcut |
|--------|----------|
| Split Vertically | `Ctrl+Shift+E` |
| Split Horizontally | `Ctrl+Shift+O` |
| Close Pane | `Ctrl+Shift+X` |
| Navigate Panes | `Ctrl+Shift+Arrow` |
| Resize Panes | `Ctrl+Shift+Alt+Arrow` |

### Security
| Action | Shortcut |
|--------|----------|
| Toggle Recon Sidebar | `Ctrl+Shift+R` |
| Open Payload Palette | `Ctrl+Shift+P` |

### General
| Action | Shortcut |
|--------|----------|
| Command Palette | `Ctrl+Shift+P` |
| Search | `Ctrl+Shift+F` |
| Settings | `Ctrl+Shift+,` |
| Copy | `Ctrl+Shift+C` |
| Paste | `Ctrl+Shift+V` |
| Zoom In | `Ctrl++` |
| Zoom Out | `Ctrl+-` |
| Reset Zoom | `Ctrl+0` |

See [docs/KEYBINDINGS.md](docs/KEYBINDINGS.md) for all shortcuts.

## Security Tools

### Recon Sidebar
Automatically extracts security-relevant data from terminal output:
- CVEs and vulnerabilities
- Open ports and services
- URLs and endpoints
- Hostnames and IPs
- JWTs and tokens
- Base64 encoded strings
- Credentials and secrets

### Payload Palette
Quick access to common payloads:
- **Reverse Shells** - Bash, Python, Perl, Netcat, PHP, Ruby, Groovy, PowerShell
- **LFI/SSTI** - Path traversal, template injection
- **Encoding** - Base64, URL encode/decode
- **Enumeration** - Nmap, Gobuster, Feroxbuster, Subfinder, Nikto
- **Privilege Escalation** - LinPEAS, LinEnum, SUID finder

### Built-in Handler
Start a TCP listener directly in Pulse:
- Listen on any port for incoming reverse shells
- View active connections
- Stop/remove handlers

### Wordlists
Integrated wordlist paths:
- RockYou
- SecLists (Web-Content, Subdomains, Names, Passwords, API Endpoints)
- DirBuster
- Raft (Small/Medium/Large)
- WFuzz

## Themes

| Theme | Variant | Preview |
|-------|---------|---------|
| Catppuccin Mocha | Dark | `#1e1e2e` background |
| Catppuccin Latte | Light | `#eff1f5` background |
| Dracula | Dark | `#282a36` background |
| Tokyo Night | Dark | `#1a1b26` background |
| Nord | Dark | `#2e3440` background |
| Gruvbox Dark | Dark | `#282828` background |

See [docs/THEMES.md](docs/THEMES.md) for creating custom themes.

## Built With

- [Tauri](https://tauri.app/) - Desktop framework
- [Rust](https://www.rust-lang.org/) - Systems language
- [React](https://react.dev/) - UI library
- [xterm.js](https://xtermjs.org/) - Terminal emulator
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

## Roadmap

- [ ] Sixel graphics support
- [ ] SSH integration
- [ ] Session persistence
- [ ] Custom shaders
- [ ] Plugin system
- [ ] Screenshot/recording
- [ ] Multi-monitor support

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by [Terminator](https://gnome-terminator.org/), [Alacritty](https://alacritty.org/), and [WezTerm](https://wezfurlong.org/wezterm/)
- Theme colors from [Catppuccin](https://catppuccin.com/)
