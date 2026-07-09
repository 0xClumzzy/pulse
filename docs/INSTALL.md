# Installation

## Quick Install

The fastest way to install Pulse on any supported distro:

```bash
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash
```

This will:
- Auto-detect your distro and architecture (x86_64 or aarch64)
- Check and prompt for missing dependencies
- Clone the repository
- Build from source
- Install to `~/.local/bin/pulse`

### Uninstall

```bash
rm ~/.local/bin/pulse
```

## Distro-Specific Instructions

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

# Install Pulse (builds from source)
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash
```

Or install a pre-built package:

```bash
# Binary (no dependencies needed at runtime beyond WebKitGTK)
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse-x86_64
chmod +x pulse-x86_64
sudo mv pulse-x86_64 /usr/local/bin/pulse

# .deb package
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse_0.1.0_amd64.deb
sudo dpkg -i pulse_0.1.0_amd64.deb
```

### Fedora / RHEL

```bash
# Install dependencies
sudo dnf install curl git nodejs npm rust cargo webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel openssl-devel

# Install Pulse (builds from source)
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash
```

Or install a pre-built package:

```bash
# Binary
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse-x86_64
chmod +x pulse-x86_64
sudo mv pulse-x86_64 /usr/local/bin/pulse

# .rpm package
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse-0.1.0-1.x86_64.rpm
sudo rpm -i pulse-0.1.0-1.x86_64.rpm
```

### Other Distros

Install the required dependencies for your distro, then run the install script:

```bash
curl -sSL https://raw.githubusercontent.com/0xClumzzy/pulse/main/install.sh | bash
```

The required dependencies are:
- `curl`, `git`, `nodejs`, `npm`, `rust`/`cargo`
- `webkit2gtk-4.1`, `gtk3`, `libayatana-appindicator`, `librsvg`, `openssl`

## Build from Source

See [BUILDING.md](BUILDING.md) for detailed instructions.

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

## Verifying Installation

```bash
# Check if binary exists
which pulse

# Or run directly
pulse
```

## Uninstalling

### If installed via install script
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
