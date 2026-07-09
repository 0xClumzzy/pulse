# Themes

Pulse includes 6 built-in themes and supports fully custom themes.

## Built-in Themes

### Catppuccin Mocha (Default)
The default dark theme with warm, cozy colors.

| Element | Color |
|---------|-------|
| Background | `#1e1e2e` |
| Foreground | `#cdd6f4` |
| Accent | `#94e2d5` |
| Cursor | `#f5e0dc` |

### Catppuccin Latte
A light theme for daytime use.

| Element | Color |
|---------|-------|
| Background | `#eff1f5` |
| Foreground | `#4c4f69` |
| Accent | `#179299` |
| Cursor | `#dc8a78` |

### Dracula
Popular dark theme with vibrant colors.

| Element | Color |
|---------|-------|
| Background | `#282a36` |
| Foreground | `#f8f8f2` |
| Accent | `#bd93f9` |
| Cursor | `#f8f8f2` |

### Tokyo Night
Dark theme inspired by Tokyo's night lights.

| Element | Color |
|---------|-------|
| Background | `#1a1b26` |
| Foreground | `#a9b1d6` |
| Accent | `#7aa2f7` |
| Cursor | `#c0caf5` |

### Nord
Arctic, north-bluish clean theme.

| Element | Color |
|---------|-------|
| Background | `#2e3440` |
| Foreground | `#d8dee9` |
| Accent | `#88c0d0` |
| Cursor | `#d8dee9` |

### Gruvbox Dark
Retro groove color scheme.

| Element | Color |
|---------|-------|
| Background | `#282828` |
| Foreground | `#ebdbb2` |
| Accent | `#fabd2f` |
| Cursor | `#ebdbb2` |

## Switching Themes

### Via Settings UI
1. Open Settings (`Ctrl+Shift+,`)
2. Click on a theme card
3. Changes apply instantly

### Via Configuration

Edit `~/.config/pulse/config.toml`:

```toml
[theme]
name = "dracula"
```

## Custom Themes

### Theme File Format

Create a TypeScript file in `~/.config/pulse/themes/`:

```typescript
// ~/.config/pulse/themes/my-theme.ts
import type { Theme } from 'pulse/types/theme';

export const myTheme: Theme = {
  metadata: {
    name: 'My Custom Theme',
    author: 'Your Name',
    variant: 'dark',  // or 'light'
    version: '1.0',
  },
  
  // ANSI color palette
  palette: {
    black: '#1e1e2e',
    red: '#f38ba8',
    green: '#a6e3a1',
    yellow: '#f9e2af',
    blue: '#89b4fa',
    magenta: '#f5c2e7',
    cyan: '#94e2d5',
    white: '#cdd6f4',
    brightBlack: '#585b70',
    brightRed: '#f38ba8',
    brightGreen: '#a6e3a1',
    brightYellow: '#f9e2af',
    brightBlue: '#89b4fa',
    brightMagenta: '#f5c2e7',
    brightCyan: '#94e2d5',
    brightWhite: '#f5f9ff',
    // Extended colors (optional)
    peach: '#fab387',
    teal: '#94e2d5',
    mauve: '#cba6f7',
    pink: '#f5c2e7',
  },
  
  // Primary colors
  background: '#1e1e2e',
  foreground: '#cdd6f4',
  
  // Cursor
  cursor: {
    text: '#1e1e2e',
    cursor: '#f5e0dc',
    style: 'block',     // 'block', 'bar', or 'underline'
    opacity: 1.0,
    blinking: true,
    blinkInterval: 500,
  },
  
  // Selection
  selection: {
    background: '#313244',
    foreground: '#cdd6f4',
  },
  
  // Window appearance
  window: {
    opacity: 0.9,
    blurRadius: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#313244',
    shadow: true,
    shadowBlur: 32,
    shadowOpacity: 0.5,
    paddingX: 0,
    paddingY: 0,
  },
  
  // Font
  font: {
    family: 'JetBrains Mono, Fira Code, monospace',
    fallback: 'monospace',
    size: 14,
    weight: 'normal',
    style: 'normal',
    ligatures: true,
  },
  
  // Glass effects
  glass: {
    enabled: true,
    blurRadius: 24,
    noiseOpacity: 0.02,
    saturation: 180,
  },
  
  // Animations
  animations: {
    enabled: true,
    duration: 200,
    easing: 'ease-out',
  },
  
  // Tab bar
  tabBar: {
    height: 36,
    background: '#181825',
    borderHeight: 1,
    borderColor: '#313244',
    tabPaddingX: 16,
  },
  
  // Pane dividers
  pane: {
    borderWidth: 1,
    borderColor: '#313244',
    activeBorderColor: '#94e2d5',
    splitterSize: 4,
  },
  
  // Keybindings (optional, uses defaults if omitted)
  keybindings: {
    newTab: 'Ctrl+Shift+T',
    closeTab: 'Ctrl+Shift+W',
    // ... etc
  },
};
```

### Theme Properties

#### Metadata
```typescript
metadata: {
  name: string;        // Display name
  author: string;      // Author name
  variant: 'dark' | 'light';
  version: string;     // Semantic version
}
```

#### Palette (ANSI Colors)
```typescript
palette: {
  // Standard colors (0-7)
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  
  // Bright colors (8-15)
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
  
  // Extended colors (optional)
  peach?: string;
  teal?: string;
  mauve?: string;
  pink?: string;
}
```

#### Window Configuration
```typescript
window: {
  opacity: number;        // 0.0 - 1.0
  blurRadius: number;     // 0 - 40 pixels
  borderRadius: number;   // 0 - 24 pixels
  borderWidth: number;    // 0 - 4 pixels
  borderColor: string;    // Hex color
  shadow: boolean;        // Enable/disable shadow
  shadowBlur: number;     // Shadow blur radius
  shadowOpacity: number;  // 0.0 - 1.0
  paddingX: number;       // Horizontal padding
  paddingY: number;       // Vertical padding
}
```

#### Font Configuration
```typescript
font: {
  family: string;       // Font family stack
  fallback: string;     // Fallback font
  size: number;         // Font size in pixels
  weight: string;       // 'thin' | 'light' | 'normal' | 'medium' | 'bold' | 'heavy'
  style: string;        // 'normal' | 'italic'
  ligatures: boolean;   // Enable ligatures
}
```

#### Glass Effects
```typescript
glass: {
  enabled: boolean;       // Enable glass effects
  blurRadius: number;     // Background blur intensity
  noiseOpacity: number;   // Noise texture opacity (0.0 - 0.1)
  saturation: number;     // Color saturation (100 - 200)
}
```

### Importing Alacritty Themes

Pulse can import themes from Alacritty's TOML format:

```bash
# Download a theme
wget https://raw.githubusercontent.com/alacritty/alacritty-theme/master/themes/dracula.toml

# Place in themes directory
mv dracula.toml ~/.config/pulse/themes/
```

The theme will be automatically detected and available in Settings.

### Color Formats

Pulse supports multiple color formats:

```typescript
// Hex (recommended)
'#1e1e2e'

// RGB (not supported, convert to hex)
// Use an online converter
```

## Glass Effects

### Enabling/Disabling

```toml
[glass]
enabled = true
blur_radius = 24
noise_opacity = 0.02
saturation = 180
```

### Adjusting Transparency

```toml
[window]
opacity = 0.85  # 85% opaque, 15% transparent
```

### Shimmer Animation

The glass overlay has a subtle shimmer animation. To disable:

```css
/* Add to custom CSS */
.glass-window::before {
  animation: none;
}
```

## Creating Light Themes

For light themes, ensure sufficient contrast:

```typescript
export const lightTheme: Theme = {
  metadata: {
    name: 'My Light Theme',
    variant: 'light',
    // ...
  },
  background: '#ffffff',  // Light background
  foreground: '#1e1e2e',  // Dark text
  selection: {
    background: '#e0e0e0',
    foreground: '#1e1e2e',
  },
  // ... rest of theme
};
```

## Theme Previews

### Creating Previews

To add a preview image for your theme:

1. Create a screenshot of your theme
2. Save as `preview.png` in the theme directory
3. Reference in theme metadata:

```typescript
metadata: {
  // ...
  preview: 'preview.png',
}
```

## Community Themes

Submit your themes to the [Pulse Themes Repository](https://github.com/0xClumzzy/pulse-themes).

### Submission Guidelines
1. Follow the theme file format
2. Include a preview image
3. Test with all UI elements
4. Ensure readability
5. Document any special features
