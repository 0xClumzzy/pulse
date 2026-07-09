# Contributing to Pulse

Thank you for your interest in contributing to Pulse! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment
- No harassment or discrimination

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) (v18+)

### System Dependencies

#### Arch Linux
```bash
sudo pacman -S --needed base-devel curl wget file rust webkit2gtk-4.1 gtk3 libayatana-appindicator librsvg libnotify openssl
```

#### Ubuntu/Debian
```bash
sudo apt install build-essential curl wget file libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev patchelf
```

#### Fedora
```bash
sudo dnf install curl wget file rust webkit2gtk4.1-devel gtk3-devel libappindicator-gtk3-devel librsvg2-devel openssl-devel
```

### Clone and Setup

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/pulse.git
cd pulse

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Development Commands

```bash
# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build

# Preview frontend build
npm run preview
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
│   │   ├── Terminal.tsx
│   │   ├── TabBar.tsx
│   │   ├── SplitPane.tsx
│   │   ├── TitleBar.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── SearchBar.tsx
│   │   └── Settings.tsx
│   ├── store/           # State management (Zustand)
│   ├── styles/          # CSS styles
│   ├── themes/          # Theme definitions
│   └── types/           # TypeScript types
├── docs/                # Documentation
├── public/              # Static assets
└── package.json         # Node dependencies
```

## Making Changes

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new theme
fix: resolve crash on startup
docs: update installation guide
refactor: improve PTY management
```

### Code Style

#### Rust
- Use `rustfmt` for formatting
- Follow Rust naming conventions
- Add doc comments for public items
- Handle errors properly with `Result`

#### TypeScript/React
- Use TypeScript strict mode
- Use functional components with hooks
- Keep components small and focused

#### CSS
- Use CSS custom properties for theming
- Support both light and dark themes
- Use modern CSS features

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Write code
   - Update documentation

3. **Test your changes**
   ```bash
   # Run locally
   npm run tauri dev
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Submit

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Changes are backwards compatible
```

## Coding Standards

### Rust Guidelines

```rust
/// Documentation comment for public items
pub fn my_function() -> Result<(), Error> {
    // Implementation
    Ok(())
}

// Use meaningful variable names
let terminal_session = create_session();

// Handle errors properly
match result {
    Ok(value) => process(value),
    Err(e) => log::error!("Error: {}", e),
}
```

### TypeScript Guidelines

```typescript
// Use interfaces for objects
interface TerminalProps {
  id: string;
  theme: Theme;
  onExit: () => void;
}

// Use functional components
export function Terminal({ id, theme, onExit }: TerminalProps) {
  // Hooks at the top
  const [state, setState] = useState(initialState);
  
  // Effects with proper cleanup
  useEffect(() => {
    const cleanup = setupTerminal();
    return cleanup;
  }, []);
  
  // Return JSX
  return <div className="terminal">...</div>;
}
```

### CSS Guidelines

```css
/* Use custom properties */
:root {
  --color-bg: #1e1e2e;
  --color-text: #cdd6f4;
}

/* BEM naming */
.tab-bar { }
.tab-bar__tab { }
.tab-bar__tab--active { }
```

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- System information (OS, version)

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered
- Additional context

## Areas for Contribution

- **Themes** - Create new color schemes
- **Documentation** - Improve guides and docs
- **Performance** - Optimize rendering
- **Features** - Implement roadmap items

## Getting Help

- Open a Discussion on GitHub
- Read the [Documentation](docs/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
