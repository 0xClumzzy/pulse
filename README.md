# Pulse

A blazing fast terminal emulator with glass aesthetics, built with Rust and React.

## Features

- **Glass Aesthetics** - Frosted glass window with blur, noise texture, and shimmer effects
- **Multiple Tabs** - Create, close, and navigate between tabs
- **Split Panes** - Split terminals horizontally or vertically
- **Multiplexing** - Run multiple terminal sessions simultaneously
- **Theme System** - 6 built-in themes + custom theme support
- **Fully Customizable** - Fonts, colors, opacity, blur, animations
- **Keyboard Shortcuts** - Terminator-compatible keybindings
- **GPU Accelerated** - WebGL rendering for smooth performance
- **Dark Mode Default** - Catppuccin Mocha theme

## Built-in Themes

- Catppuccin Mocha (default, dark)
- Catppuccin Latte (light)
- Dracula
- Tokyo Night
- Nord
- Gruvbox Dark

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

### Other
| Action | Shortcut |
|--------|----------|
| Command Palette | `Ctrl+Shift+P` |
| Search | `Ctrl+Shift+F` |
| Settings | `Ctrl+Shift+,` |

## Prerequisites

### Arch Linux
```bash
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file libappindicator-gtk3 librsvg libnotify openssl
```

### Ubuntu/Debian
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev
```

### Fedora
```bash
sudo dnf install webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel openssl-devel
```

### macOS
```bash
xcode-select --install
```

## Building

```bash
# Install dependencies
npm install

# Build for production
npm run tauri build

# Or run in development mode
npm run tauri dev
```

## Configuration

Configuration file: `~/.config/pulse/config.toml`

```toml
[window]
opacity = 0.85
blur_radius = 20

[font]
family = "JetBrains Mono"
size = 14

[theme]
name = "catppuccin-mocha"
```

## License

MIT
