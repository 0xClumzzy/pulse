# Installation

## Quick Install (curl)

The fastest way to install Pulse on Linux:

```bash
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash
```

This will:
- Auto-detect your architecture (x86_64 or aarch64)
- Download the latest release
- Install to `~/.local/bin/pulse`

### Uninstall

```bash
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash -s -- --uninstall
```

## Pre-built Packages

### Download

Get the latest release from [GitHub Releases](https://github.com/0xClumzzy/pulse/releases).

### Debian/Ubuntu (.deb)

```bash
# Download the .deb file
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse_0.1.0_amd64.deb

# Install
sudo dpkg -i pulse_0.1.0_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f
```

### Fedora/RHEL (.rpm)

```bash
# Download the .rpm file
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse-0.1.0-1.x86_64.rpm

# Install with rpm
sudo rpm -i pulse-0.1.0-1.x86_64.rpm

# Or with dnf
sudo dnf install pulse-0.1.0-1.x86_64.rpm
```

### Arch Linux

For Arch Linux, build from source or use the binary:

```bash
# Download binary
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash

# Or build from source (see below)
```

## Build from Source

See [BUILDING.md](BUILDING.md) for detailed instructions.

### Prerequisites

```bash
# Arch Linux
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file libappindicator-gtk3 librsvg libnotify openssl

# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel openssl-devel
```

### Build

```bash
# Clone
git clone https://github.com/0xClumzzy/pulse.git
cd pulse

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

The binary will be at `src-tauri/target/release/pulse`.

## System Requirements

### Minimum
- **OS**: Linux (kernel 4.14+)
- **RAM**: 100MB
- **Storage**: 50MB
- **Display**: 1280x720

### Recommended
- **OS**: Latest stable release
- **RAM**: 256MB+
- **Storage**: 100MB+
- **Display**: 1920x1080+
- **GPU**: WebGL 2.0 capable

## Dependencies

### Debian/Ubuntu
```bash
sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0 libayatana-appindicator3-1 librsvg2-0 libssl3
```

### Fedora
```bash
sudo dnf install webkit2gtk4.1 gtk3 libappindicator-gtk3 librsvg2 openssl
```

### Arch Linux
```bash
sudo pacman -S webkit2gtk-4.1 gtk3 libappindicator-gtk3 librsvg openssl
```

## Verifying Installation

After installation, verify Pulse is working:

```bash
# Check if binary exists
which pulse

# Or run directly
pulse
```

## Uninstalling

### If installed via curl script
```bash
rm ~/.local/bin/pulse
```

### If installed via .deb
```bash
sudo dpkg -r pulse
```

### If installed via .rpm
```bash
sudo rpm -e pulse
```

### If built from source
```bash
# Remove the binary
rm ~/pulse/src-tauri/target/release/pulse

# Or remove the entire project directory
rm -rf ~/pulse
```

### Configuration files
```bash
# Remove config (optional)
rm -rf ~/.config/pulse
```
