# Installation

## Pre-built Packages

### Download

Get the latest release from [GitHub Releases](https://github.com/0xClumzzy/pulse/releases).

### Linux

#### Debian/Ubuntu (.deb)
```bash
# Download the .deb file
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse_0.1.0_amd64.deb

# Install
sudo dpkg -i pulse_0.1.0_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f
```

#### Fedora/RHEL (.rpm)
```bash
# Download the .rpm file
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse-0.1.0-1.x86_64.rpm

# Install
sudo rpm -i pulse-0.1.0-1.x86_64.rpm

# Or with dnf
sudo dnf install pulse-0.1.0-1.x86_64.rpm
```

#### Arch Linux (AUR)
```bash
# Using yay
yay -S pulse

# Using paru
paru -S pulse
```

#### AppImage
```bash
# Download the AppImage
wget https://github.com/0xClumzzy/pulse/releases/download/v0.1.0/pulse_0.1.0_amd64.AppImage

# Make executable
chmod +x pulse_0.1.0_amd64.AppImage

# Run
./pulse_0.1.0_amd64.AppImage
```

### macOS

#### DMG
1. Download `Pulse.dmg` from Releases
2. Open the DMG file
3. Drag Pulse to Applications
4. Launch from Applications or Spotlight

#### Homebrew
```bash
brew install --cask pulse
```

### Windows

#### MSI Installer
1. Download `Pulse_0.1.0_x64_setup.msi` from Releases
2. Run the installer
3. Follow the setup wizard

#### Portable
1. Download `Pulse_0.1.0_x64.zip` from Releases
2. Extract to a folder
3. Run `pulse.exe`

## System Requirements

### Minimum
- **OS**: Linux (kernel 4.14+), macOS 11+, Windows 10+
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

### Linux (Debian/Ubuntu)
```bash
sudo apt install libwebkit2gtk-4.1-0 libgtk-3-0 libayatana-appindicator3-1 librsvg2-0 libssl3
```

### Linux (Fedora)
```bash
sudo dnf install webkit2gtk4.1 gtk3 libappindicator-gtk3 librsvg2 openssl
```

### Linux (Arch)
```bash
sudo pacman -S webkit2gtk-4.1 gtk3 libappindicator-gtk3 librsvg openssl
```

## Verifying Installation

After installation, verify Pulse is working:

```bash
# Check version
pulse --version

# Or launch directly
pulse
```

## Uninstalling

### Linux (deb/rpm)
```bash
# Debian/Ubuntu
sudo dpkg -r pulse

# Fedora/RHEL
sudo rpm -e pulse

# Arch
yay -R pulse
```

### macOS
1. Quit Pulse
2. Delete from Applications
3. Optional: Delete config at `~/Library/Application Support/pulse/`

### Windows
1. Open Settings > Apps
2. Find Pulse
3. Click Uninstall
