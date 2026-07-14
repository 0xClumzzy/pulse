# Keyboard Shortcuts

Pulse uses Terminator-compatible keybindings by default. All shortcuts can be customized in the Settings panel.

## Tab Management

| Action | Default Shortcut | Description |
|--------|------------------|-------------|
| New Tab | `Ctrl+Shift+T` | Create a new terminal tab |
| Close Tab | `Ctrl+Shift+W` | Close the current tab |
| Next Tab | `Ctrl+PageDown` | Switch to the next tab |
| Previous Tab | `Ctrl+PageUp` | Switch to the previous tab |
| Go to Tab 1 | `Ctrl+Alt+1` | Switch to tab 1 |
| Go to Tab 2 | `Ctrl+Alt+2` | Switch to tab 2 |
| Go to Tab 3 | `Ctrl+Alt+3` | Switch to tab 3 |
| Go to Tab 4 | `Ctrl+Alt+4` | Switch to tab 4 |
| Go to Tab 5 | `Ctrl+Alt+5` | Switch to tab 5 |
| Go to Tab 6 | `Ctrl+Alt+6` | Switch to tab 6 |
| Go to Tab 7 | `Ctrl+Alt+7` | Switch to tab 7 |
| Go to Tab 8 | `Ctrl+Alt+8` | Switch to tab 8 |
| Go to Tab 9 | `Ctrl+Alt+9` | Switch to tab 9 |

## Split Panes

| Action | Default Shortcut | Description |
|--------|------------------|-------------|
| Split Vertically | `Ctrl+Shift+E` | Split current pane top/bottom |
| Split Horizontally | `Ctrl+Shift+O` | Split current pane left/right |
| Close Pane | `Ctrl+Shift+X` | Close the current pane |
| Toggle Fullscreen Pane | `Ctrl+Shift+Z` | Maximize/restore current pane |

## Pane Navigation

| Action | Default Shortcut | Description |
|--------|------------------|-------------|
| Move Left | `Ctrl+Shift+ArrowLeft` | Focus pane to the left |
| Move Right | `Ctrl+Shift+ArrowRight` | Focus pane to the right |
| Move Up | `Ctrl+Shift+ArrowUp` | Focus pane above |
| Move Down | `Ctrl+Shift+ArrowDown` | Focus pane below |

## Pane Resize

| Action | Default Shortcut | Description |
|--------|------------------|-------------|
| Resize Left | `Ctrl+Shift+Alt+ArrowLeft` | Increase width of left pane |
| Resize Right | `Ctrl+Shift+Alt+ArrowRight` | Increase width of right pane |
| Resize Up | `Ctrl+Shift+Alt+ArrowUp` | Increase height of top pane |
| Resize Down | `Ctrl+Shift+Alt+ArrowDown` | Increase height of bottom pane |

## General

| Action | Default Shortcut | Description |
|--------|------------------|-------------|
| Copy | `Ctrl+Shift+C` | Copy selection to clipboard |
| Paste | `Ctrl+Shift+V` | Paste from clipboard |
| Search | `Ctrl+Shift+F` | Open search bar |
| Search Next | `Ctrl+G` | Find next match |
| Search Previous | `Ctrl+Shift+G` | Find previous match |
| Command Palette | `Ctrl+Shift+P` | Open command palette |
| Settings | `Ctrl+Shift+,` | Open settings panel |
| Toggle Recon Sidebar | `Ctrl+Shift+R` | Show/hide recon sidebar |
| Toggle Handler Panel | via Command Palette | Show/hide reverse shell handler |

## Zoom

| Action | Default Shortcut | Description |
|--------|------------------|-------------|
| Zoom In | `Ctrl++` | Increase font size |
| Zoom Out | `Ctrl+-` | Decrease font size |
| Reset Zoom | `Ctrl+0` | Reset font size |

## Terminal Shortcuts

These are terminal-emulator shortcuts that work inside the terminal:

| Action | Shortcut | Description |
|--------|----------|-------------|
| Interrupt | `Ctrl+C` | Send SIGINT |
| EOF | `Ctrl+D` | Send EOF |
| Clear | `Ctrl+L` | Clear screen |
| Suspend | `Ctrl+Z` | Send SIGTSTP |
| Tab Complete | `Tab` | Auto-complete |
| Reverse Search | `Ctrl+R` | Search history |

## Customizing Shortcuts

### Via Settings UI
1. Open Settings (`Ctrl+Shift+,`)
2. Navigate to Keybindings section
3. Click on a shortcut to edit
4. Press the new key combination
5. Save

### Via Configuration File

Edit `~/.config/pulse/config.toml`:

```toml
[keybindings]
new_tab = "Ctrl+Shift+T"
close_tab = "Ctrl+Shift+W"
split_horizontal = "Ctrl+Shift+O"
split_vertical = "Ctrl+Shift+E"
close_pane = "Ctrl+Shift+X"
```

### Key Modifiers

| Modifier | Description |
|----------|-------------|
| `Ctrl` | Control key |
| `Shift` | Shift key |
| `Alt` | Alt/Option key |
| `Super` | Super/Command/Windows key |

### Special Keys

| Key Name | Description |
|----------|-------------|
| `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` | Arrow keys |
| `PageUp`, `PageDown` | Page navigation |
| `Home`, `End` | Line start/end |
| `F1`-`F12` | Function keys |
| `Space`, `Tab`, `Backspace`, `Delete` | Special keys |

## Terminator Compatibility

Pulse aims for compatibility with Terminator's default keybindings:

| Action | Terminator | Pulse |
|--------|------------|-------|
| New Tab | `Ctrl+Shift+T` | `Ctrl+Shift+T` ✓ |
| Close Tab | `Ctrl+Shift+W` | `Ctrl+Shift+W` ✓ |
| Split Horizontal | `Ctrl+Shift+E` | `Ctrl+Shift+E` ✓ |
| Split Vertical | `Ctrl+Shift+O` | `Ctrl+Shift+O` ✓ |
| Close Pane | `Ctrl+Shift+X` | `Ctrl+Shift+X` ✓ |
| Toggle Fullscreen | `F11` | `F11` ✓ |

## tmux Compatibility

If you prefer tmux-style keybindings, you can configure Pulse to use `Ctrl+B` as the prefix:

```toml
[keybindings]
# tmux-style prefix (requires pressing Ctrl+B then the command key)
# Note: This requires custom implementation
```

## Vi Mode

Pulse supports vi-style navigation when in copy mode:

| Key | Action |
|-----|--------|
| `h` | Move left |
| `j` | Move down |
| `k` | Move up |
| `l` | Move right |
| `w` | Move to next word |
| `b` | Move to previous word |
| `0` | Move to line start |
| `$` | Move to line end |
| `gg` | Move to buffer start |
| `G` | Move to buffer end |
| `/` | Search forward |
| `?` | Search backward |
| `n` | Next search match |
| `N` | Previous search match |
| `y` | Copy selection |
| `Escape` | Exit vi mode |
