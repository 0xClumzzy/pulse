# Configuration

Pulse can be configured via the Settings UI or by editing the configuration file directly.

## Configuration File

Location: `~/.config/pulse/config.toml`

```bash
# Create config directory
mkdir -p ~/.config/pulse

# Create config file
touch ~/.config/pulse/config.toml
```

## Configuration Options

### Window Settings

```toml
[window]
# Window opacity (0.0 - 1.0)
opacity = 0.9

# Background blur radius (0 - 40)
blur_radius = 24

# Window border radius (0 - 24)
border_radius = 12

# Border width (0 - 4)
border_width = 1

# Border color (hex)
border_color = "#313244"

# Enable drop shadow
shadow = true

# Shadow blur radius
shadow_blur = 32

# Shadow opacity (0.0 - 1.0)
shadow_opacity = 0.5

# Horizontal padding (pixels)
padding_x = 0

# Vertical padding (pixels)
padding_y = 0

# Initial window size
width = 1200
height = 800

# Minimum window size
min_width = 600
min_height = 400

# Window decorations (title bar)
decorations = false

# Start centered
center = true
```

### Font Settings

```toml
[font]
# Font family (comma-separated list)
family = "JetBrains Mono, Fira Code, monospace"

# Fallback font
fallback = "monospace"

# Font size in pixels
size = 14

# Font weight: thin, light, normal, medium, bold, heavy
weight = "normal"

# Font style: normal, italic
style = "normal"

# Enable ligatures
ligatures = true
```

### Glass Effects

```toml
[glass]
# Enable glass effects
enabled = true

# Blur radius (0 - 40)
blur_radius = 24

# Noise texture opacity (0.0 - 0.1)
noise_opacity = 0.02

# Color saturation (100 - 200)
saturation = 180
```

### Cursor Settings

```toml
[cursor]
# Cursor style: block, bar, underline
style = "block"

# Enable cursor blinking
blinking = true

# Blink interval in milliseconds
blink_interval = 500

# Cursor opacity (0.0 - 1.0)
opacity = 1.0

# Cursor color (hex)
cursor_color = "#f5e0dc"

# Text color under cursor (hex)
text_color = "#1e1e2e"
```

### Selection Settings

```toml
[selection]
# Selection background color (hex)
background = "#313244"

# Selection text color (hex)
foreground = "#cdd6f4"

# Copy on select
copy_on_select = true
```

### Tab Bar Settings

```toml
[tab_bar]
# Tab bar height (pixels)
height = 36

# Background color (hex)
background = "#181825"

# Bottom border height
border_height = 1

# Border color (hex)
border_color = "#313244"

# Tab horizontal padding
tab_padding_x = 16
```

### Pane Settings

```toml
[pane]
# Border width between panes
border_width = 1

# Border color (hex)
border_color = "#313244"

# Active pane border color (hex)
active_border_color = "#94e2d5"

# Splitter size (pixels)
splitter_size = 4
```

### Animation Settings

```toml
[animations]
# Enable animations
enabled = true

# Default animation duration (milliseconds)
duration = 200

# Animation easing: ease, ease-in, ease-out, ease-in-out
easing = "ease-out"
```

### Search Settings

```toml
[search]
# Search bar background color (hex)
background = "#181825"

# Search bar opacity
opacity = 0.95

# Match highlight color (hex)
match_highlight = "#f9e2af"
```

### Scrollback Settings

```toml
[scrollback]
# Number of lines to keep in scrollback
lines = 10000

# Scrollbar width (pixels)
scrollbar_width = 8

# Scrollbar thumb color (hex)
thumb_color = "#585b70"

# Scrollbar thumb hover color (hex)
thumb_hover_color = "#6c7086"
```

### Keybindings

```toml
[keybindings]
# Tab management
new_tab = "Ctrl+Shift+T"
close_tab = "Ctrl+Shift+W"
next_tab = "Ctrl+PageDown"
prev_tab = "Ctrl+PageUp"
goto_tab_1 = "Ctrl+Alt+1"
goto_tab_2 = "Ctrl+Alt+2"
goto_tab_3 = "Ctrl+Alt+3"
goto_tab_4 = "Ctrl+Alt+4"
goto_tab_5 = "Ctrl+Alt+5"
goto_tab_6 = "Ctrl+Alt+6"
goto_tab_7 = "Ctrl+Alt+7"
goto_tab_8 = "Ctrl+Alt+8"
goto_tab_9 = "Ctrl+Alt+9"

# Split panes
split_horizontal = "Ctrl+Shift+O"
split_vertical = "Ctrl+Shift+E"
close_pane = "Ctrl+Shift+X"
toggle_fullscreen_pane = "Ctrl+Shift+Z"

# Pane navigation
pane_left = "Ctrl+Shift+ArrowLeft"
pane_right = "Ctrl+Shift+ArrowRight"
pane_up = "Ctrl+Shift+ArrowUp"
pane_down = "Ctrl+Shift+ArrowDown"

# Pane resize
resize_pane_left = "Ctrl+Shift+Alt+ArrowLeft"
resize_pane_right = "Ctrl+Shift+Alt+ArrowRight"
resize_pane_up = "Ctrl+Shift+Alt+ArrowUp"
resize_pane_down = "Ctrl+Shift+Alt+ArrowDown"

# Clipboard
copy = "Ctrl+Shift+C"
paste = "Ctrl+Shift+V"

# Search
search = "Ctrl+Shift+F"
search_next = "Ctrl+G"
search_prev = "Ctrl+Shift+G"

# Zoom
zoom_in = "Ctrl+Equal"
zoom_out = "Ctrl+Minus"
zoom_reset = "Ctrl+0"

# UI
command_palette = "Ctrl+Shift+P"
settings = "Ctrl+Shift+,"
reload_config = "Ctrl+Shift+R"
toggle_sidebar = "Ctrl+Shift+B"
toggle_fullscreen = "F11"
```

### Shell Settings

```toml
[shell]
# Shell executable (auto-detected if empty)
executable = ""

# Shell arguments
args = ["--login"]

# Working directory (auto-detected if empty)
cwd = ""

# Environment variables
env = {
  TERM = "xterm-256color",
  COLORTERM = "truecolor",
}
```

### Theme Settings

```toml
[theme]
# Theme name (built-in or custom)
name = "catppuccin-mocha"
```

## Full Configuration Example

```toml
# ~/.config/pulse/config.toml

[window]
opacity = 0.85
blur_radius = 20
border_radius = 12
border_width = 1
border_color = "#313244"
shadow = true
shadow_blur = 32
shadow_opacity = 0.4
width = 1400
height = 900
decorations = false
center = true

[font]
family = "JetBrains Mono, Fira Code, monospace"
size = 15
weight = "normal"
ligatures = true

[glass]
enabled = true
blur_radius = 20
noise_opacity = 0.02
saturation = 180

[cursor]
style = "block"
blinking = true
blink_interval = 500

[selection]
copy_on_select = true

[tab_bar]
height = 36
background = "#181825"

[pane]
border_width = 1
border_color = "#313244"
active_border_color = "#94e2d5"

[animations]
enabled = true
duration = 200
easing = "ease-out"

[scrollback]
lines = 50000

[shell]
executable = "/bin/zsh"
args = ["--login"]

[theme]
name = "catppuccin-mocha"

[keybindings]
new_tab = "Ctrl+Shift+T"
close_tab = "Ctrl+Shift+W"
split_horizontal = "Ctrl+Shift+O"
split_vertical = "Ctrl+Shift+E"
close_pane = "Ctrl+Shift+X"
copy = "Ctrl+Shift+C"
paste = "Ctrl+Shift+V"
search = "Ctrl+Shift+F"
command_palette = "Ctrl+Shift+P"
settings = "Ctrl+Shift+,"
```

## Configuration Validation

Pulse validates configuration on startup. If there are errors:

1. Check the console output for error messages
2. Fix the syntax errors
3. Restart Pulse or press `Ctrl+Shift+R` to reload

### Common Errors

#### Invalid TOML syntax
```toml
# Wrong
opacity = 0.9  # Missing quotes around string

# Correct
opacity = 0.9
```

#### Invalid color format
```toml
# Wrong
border_color = 313244

# Correct
border_color = "#313244"
```

#### Invalid value range
```toml
# Wrong
opacity = 1.5  # Must be 0.0 - 1.0

# Correct
opacity = 0.9
```

## Configuration Locations

| Platform | Location |
|----------|----------|
| Linux | `~/.config/pulse/config.toml` |
| macOS | `~/Library/Application Support/pulse/config.toml` |
| Windows | `%APPDATA%\pulse\config.toml` |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PULSE_CONFIG_DIR` | Override config directory |
| `PULSE_THEME` | Override theme |
| `SHELL` | Default shell (fallback: `/bin/sh`) |
| `TERM` | Terminal type |
| `COLORTERM` | Color terminal support |

## Config Reload

Pulse supports hot-reloading configuration:

1. Press `Ctrl+Shift+R` in Pulse
2. Or edit the config file and save
3. Changes apply immediately (except some window settings)
