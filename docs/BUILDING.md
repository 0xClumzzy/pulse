# Building from Source

## Prerequisites

### Rust
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
cargo --version
```

### Node.js
```bash
# Install Node.js 18+
# Using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# Or using fnm
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 18

# Verify
node --version
npm --version
```

### System Dependencies

#### Arch Linux
```bash
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file libappindicator-gtk3 librsvg libnotify openssl
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev patchelf
```

#### Fedora
```bash
sudo dnf install webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel openssl-devel
```

#### macOS
```bash
xcode-select --install
```

#### Windows
- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

## Clone Repository

```bash
git clone https://github.com/0xClumzzy/pulse.git
cd pulse
```

## Install Dependencies

```bash
npm install
```

## Development

### Run in Development Mode

```bash
npm run tauri dev
```

This will:
1. Start the Vite dev server
2. Compile the Rust backend
3. Launch Pulse with hot-reload

### Development with Logs

```bash
# Enable Rust logging
RUST_LOG=debug npm run tauri dev
```

## Building

### Build for Production

```bash
npm run tauri build
```

This creates:
- `src-tauri/target/release/pulse` - Binary
- `src-tauri/target/release/bundle/deb/*.deb` - Debian package
- `src-tauri/target/release/bundle/rpm/*.rpm` - Fedora package

### Build Specific Target

```bash
# Release build
cargo build --release

# Debug build
cargo build
```

### Build Optimizations

For smaller binaries:

```bash
# In Cargo.toml, ensure these settings
[profile.release]
strip = true
lto = true
codegen-units = 1
opt-level = "s"
panic = "abort"
```

## Project Structure

```
pulse/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Entry point
│   │   ├── lib.rs       # Tauri commands
│   │   └── terminal/
│   │       └── mod.rs   # PTY management
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri config
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── hooks/           # React hooks
│   ├── store/           # State management
│   ├── styles/          # CSS styles
│   ├── themes/          # Theme definitions
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json         # Node dependencies
```

## Troubleshooting

### Build Errors

#### Missing system libraries
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev

# Check installed
dpkg -l | grep webkit2gtk
```

#### Rust compilation errors
```bash
# Update Rust
rustup update

# Clean build
cargo clean
cargo build --release
```

#### Node.js errors
```bash
# Clear cache
rm -rf node_modules
npm install
```

### Runtime Errors

#### "WebKitGTK not found"
Install the correct WebKit2GTK version (4.1, not 4.0):
```bash
# Ubuntu 22.04+
sudo apt install libwebkit2gtk-4.1-0

# Ubuntu 20.04
sudo apt install libwebkit2gtk-4.0-37
```

#### "GLIBC version too old"
Your system may be too old. Use a recent Linux distribution.

## Cross-Compilation

### Linux ARM64
```bash
# Install target
rustup target add aarch64-unknown-linux-gnu

# Install cross-compilation tools
sudo apt install gcc-aarch64-linux-gnu

# Build
cargo build --release --target aarch64-unknown-linux-gnu
```

### macOS Universal
```bash
# Build for both architectures
cargo build --release --target aarch64-apple-darwin
cargo build --release --target x86_64-apple-darwin

# Create universal binary
lipo -create \
  target/aarch64-apple-darwin/release/pulse \
  target/x86_64-apple-darwin/release/pulse \
  -output pulse-universal
```

## CI/CD

The project includes a GitHub Actions workflow for automated releases.

### Triggering a Release

```bash
# Tag a release
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

This triggers the release workflow which builds for:
- Linux (x64, ARM64)
- macOS (x64, ARM64)
- Windows (x64)
