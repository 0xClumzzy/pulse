# Changelog

All notable changes to Pulse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Initial release
- Glass aesthetics with blur and transparency
- Multiple tabs with animated switching
- Split panes (horizontal/vertical)
- 6 built-in themes (Catppuccin Mocha, Catppuccin Latte, Dracula, Tokyo Night, Nord, Gruvbox)
- Full settings panel
- Command palette (Ctrl+Shift+P)
- Search in scrollback (Ctrl+Shift+F)
- Terminator-compatible keyboard shortcuts
- GPU-accelerated WebGL rendering
- Dark mode by default
- Tauri v2 + Rust backend
- React + TypeScript frontend
- GitHub Actions CI/CD
- DEB and RPM package builds

### Fixed
- N/A (initial release)

### Changed
- N/A (initial release)

### Removed
- N/A (initial release)

---

## [0.1.0] - 2025-07-09

### Added

#### Core Features
- Terminal emulation via xterm.js with WebGL acceleration
- PTY management using portable-pty (Rust)
- Tab-based interface with smooth animations
- Split pane layout (recursive, horizontal/vertical)
- Command palette for quick actions
- Search functionality with highlight

#### Visual Features
- Frosted glass window effect with blur
- Noise texture overlay
- Shimmer animation on glass overlay
- Drop shadows with configurable intensity
- Custom window controls (macOS-style dots)
- Focus indicators with glow effect

#### Theme System
- 6 built-in themes
- Catppuccin Mocha (default, dark)
- Catppuccin Latte (light)
- Dracula
- Tokyo Night
- Nord
- Gruvbox Dark
- Live theme switching
- Full theme customization via settings

#### Keyboard Shortcuts
- Terminator-compatible keybindings
- Tab management (new, close, navigate)
- Split pane controls
- Pane navigation and resize
- Copy/paste support
- Search shortcuts
- Command palette
- Settings access
- Zoom controls

#### Configuration
- TOML-based configuration file
- Hot-reload support (Ctrl+Shift+R)
- Persistent settings via localStorage
- Environment variable support

#### Build & Distribution
- Tauri v2 framework
- GitHub Actions CI/CD
- DEB package (Debian/Ubuntu)
- RPM package (Fedora/RHEL)
- Cross-platform support (Linux, macOS, Windows)

### Technical Details
- **Backend**: Rust with Tauri v2
- **Frontend**: React 19 + TypeScript
- **Terminal**: xterm.js 6.0 with WebGL addon
- **State**: Zustand
- **Animations**: Framer Motion
- **Build**: Vite 8

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2025-07-09 | Initial release |

---

## Upcoming Features

### 0.2.0 (Planned)
- Sixel graphics support
- SSH integration
- Session persistence
- Custom shaders
- Plugin system

### 0.3.0 (Planned)
- Windows Terminal import
- macOS native tabs
- More built-in themes
- Theme marketplace

### 1.0.0 (Future)
- Stable release
- Full feature parity with Terminator
- Performance optimizations
- Accessibility improvements

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute to this project.

## License

MIT License - see [LICENSE](LICENSE) for details.
