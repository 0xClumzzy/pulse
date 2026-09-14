use serde::{Deserialize, Serialize};
use std::path::PathBuf;

const CONFIG_FILE_NAME: &str = "config.toml";
const LEGACY_CONFIG_FILE: &str = "theme.json";

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PulseConfig {
    #[serde(default)]
    pub window: WindowConfig,
    #[serde(default)]
    pub font: FontConfig,
    #[serde(default)]
    pub glass: GlassConfig,
    #[serde(default)]
    pub cursor: CursorConfig,
    #[serde(default)]
    pub selection: SelectionConfig,
    #[serde(default)]
    pub tab_bar: TabBarConfig,
    #[serde(default)]
    pub pane: PaneConfig,
    #[serde(default)]
    pub animations: AnimationConfig,
    #[serde(default)]
    pub keybindings: KeybindingsConfig,
    #[serde(default)]
    pub shell: ShellConfig,
    #[serde(default)]
    pub theme: ThemeRefConfig,
    #[serde(default)]
    pub pulse: PulseFeatures,
    #[serde(default)]
    pub shader: ShaderConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WindowConfig {
    #[serde(default = "default_opacity")]
    pub opacity: f64,
    #[serde(default = "default_blur_radius")]
    pub blur_radius: u32,
    #[serde(default = "default_border_radius")]
    pub border_radius: u32,
    #[serde(default = "default_border_width")]
    pub border_width: u32,
    #[serde(default = "default_border_color")]
    pub border_color: String,
    #[serde(default = "default_true")]
    pub shadow: bool,
    #[serde(default = "default_shadow_blur")]
    pub shadow_blur: u32,
    #[serde(default = "default_shadow_opacity")]
    pub shadow_opacity: f64,
    #[serde(default)]
    pub padding_x: u32,
    #[serde(default)]
    pub padding_y: u32,
    #[serde(default = "default_width")]
    pub width: u32,
    #[serde(default = "default_height")]
    pub height: u32,
    #[serde(default = "default_min_width")]
    pub min_width: u32,
    #[serde(default = "default_min_height")]
    pub min_height: u32,
    #[serde(default)]
    pub decorations: bool,
    #[serde(default = "default_true")]
    pub center: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FontConfig {
    #[serde(default = "default_font_family")]
    pub family: String,
    #[serde(default = "default_font_fallback")]
    pub fallback: String,
    #[serde(default = "default_font_size")]
    pub size: u32,
    #[serde(default = "default_font_weight")]
    pub weight: String,
    #[serde(default = "default_font_style")]
    pub style: String,
    #[serde(default = "default_true")]
    pub ligatures: bool,
    #[serde(default = "default_scrollback")]
    pub scrollback: u32,
    #[serde(default)]
    pub font_features: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GlassConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default = "default_blur_radius")]
    pub blur_radius: u32,
    #[serde(default = "default_noise_opacity")]
    pub noise_opacity: f64,
    #[serde(default = "default_saturation")]
    pub saturation: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CursorConfig {
    #[serde(default = "default_cursor_style")]
    pub style: String,
    #[serde(default = "default_true")]
    pub blinking: bool,
    #[serde(default = "default_blink_interval")]
    pub blink_interval: u32,
    #[serde(default = "default_cursor_opacity")]
    pub opacity: f64,
    #[serde(default = "default_cursor_color")]
    pub cursor_color: String,
    #[serde(default = "default_text_color")]
    pub text_color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SelectionConfig {
    #[serde(default = "default_selection_bg")]
    pub background: String,
    #[serde(default = "default_selection_fg")]
    pub foreground: String,
    #[serde(default)]
    pub copy_on_select: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TabBarConfig {
    #[serde(default = "default_tab_height")]
    pub height: u32,
    #[serde(default = "default_tab_bar_bg")]
    pub background: String,
    #[serde(default = "default_border_height")]
    pub border_height: u32,
    #[serde(default = "default_tab_bar_border")]
    pub border_color: String,
    #[serde(default = "default_tab_padding")]
    pub tab_padding_x: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PaneConfig {
    #[serde(default = "default_pane_border_width")]
    pub border_width: u32,
    #[serde(default = "default_border_color")]
    pub border_color: String,
    #[serde(default = "default_active_border")]
    pub active_border_color: String,
    #[serde(default = "default_splitter_size")]
    pub splitter_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AnimationConfig {
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default = "default_anim_duration")]
    pub duration: u32,
    #[serde(default = "default_easing")]
    pub easing: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeybindingsConfig {
    #[serde(default = "default_new_tab")]
    pub new_tab: String,
    #[serde(default = "default_close_tab")]
    pub close_tab: String,
    #[serde(default = "default_next_tab")]
    pub next_tab: String,
    #[serde(default = "default_prev_tab")]
    pub prev_tab: String,
    #[serde(default = "default_split_horizontal")]
    pub split_horizontal: String,
    #[serde(default = "default_split_vertical")]
    pub split_vertical: String,
    #[serde(default = "default_close_pane")]
    pub close_pane: String,
    #[serde(default = "default_pane_left")]
    pub pane_left: String,
    #[serde(default = "default_pane_right")]
    pub pane_right: String,
    #[serde(default = "default_pane_up")]
    pub pane_up: String,
    #[serde(default = "default_pane_down")]
    pub pane_down: String,
    #[serde(default = "default_copy")]
    pub copy: String,
    #[serde(default = "default_paste")]
    pub paste: String,
    #[serde(default = "default_search")]
    pub search: String,
    #[serde(default = "default_command_palette")]
    pub command_palette: String,
    #[serde(default = "default_settings")]
    pub settings: String,
    #[serde(default = "default_zoom_in")]
    pub zoom_in: String,
    #[serde(default = "default_zoom_out")]
    pub zoom_out: String,
    #[serde(default = "default_zoom_reset")]
    pub zoom_reset: String,
    #[serde(default = "default_payload_palette")]
    pub payload_palette: String,
    #[serde(default = "default_recon")]
    pub recon: String,
    #[serde(default = "default_quick_terminal")]
    pub quick_terminal: String,
}

impl Default for KeybindingsConfig {
    fn default() -> Self {
        Self {
            new_tab: default_new_tab(),
            close_tab: default_close_tab(),
            next_tab: default_next_tab(),
            prev_tab: default_prev_tab(),
            split_horizontal: default_split_horizontal(),
            split_vertical: default_split_vertical(),
            close_pane: default_close_pane(),
            pane_left: default_pane_left(),
            pane_right: default_pane_right(),
            pane_up: default_pane_up(),
            pane_down: default_pane_down(),
            copy: default_copy(),
            paste: default_paste(),
            search: default_search(),
            command_palette: default_command_palette(),
            settings: default_settings(),
            zoom_in: default_zoom_in(),
            zoom_out: default_zoom_out(),
            zoom_reset: default_zoom_reset(),
            payload_palette: default_payload_palette(),
            recon: default_recon(),
            quick_terminal: default_quick_terminal(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellConfig {
    #[serde(default)]
    pub executable: String,
    #[serde(default = "default_shell_args")]
    pub args: Vec<String>,
    #[serde(default)]
    pub cwd: String,
    #[serde(default = "default_shell_env")]
    pub env: std::collections::HashMap<String, String>,
}

impl Default for ShellConfig {
    fn default() -> Self {
        Self {
            executable: String::new(),
            args: default_shell_args(),
            cwd: String::new(),
            env: default_shell_env(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ThemeRefConfig {
    #[serde(default = "default_theme_name")]
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PulseFeatures {
    #[serde(default)]
    pub visual_bell: bool,
    #[serde(default = "default_visual_bell_duration")]
    pub visual_bell_duration: u32,
    #[serde(default = "default_true")]
    pub command_notifications: bool,
    #[serde(default)]
    pub auto_theme_switch: bool,
    #[serde(default)]
    pub light_theme: Option<String>,
    #[serde(default)]
    pub background_image: Option<String>,
    #[serde(default = "default_bg_image_opacity")]
    pub background_image_opacity: f64,
    #[serde(default = "default_bg_image_fit")]
    pub background_image_fit: String,
    #[serde(default = "default_true")]
    pub scrollbar: bool,
    #[serde(default = "default_scrollbar_style")]
    pub scrollbar_style: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShaderConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default = "default_shader_preset")]
    pub preset: String,
    #[serde(default = "default_shader_fragment")]
    pub custom_fragment: String,
    #[serde(default = "default_shader_intensity")]
    pub intensity: f64,
    #[serde(default = "default_shader_speed")]
    pub speed: f64,
}

impl Default for ShaderConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            preset: default_shader_preset(),
            custom_fragment: default_shader_fragment(),
            intensity: default_shader_intensity(),
            speed: default_shader_speed(),
        }
    }
}

// Default value functions
fn default_opacity() -> f64 { 0.9 }
fn default_blur_radius() -> u32 { 24 }
fn default_border_radius() -> u32 { 12 }
fn default_border_width() -> u32 { 1 }
fn default_border_color() -> String { "#313244".to_string() }
fn default_true() -> bool { true }
fn default_shadow_blur() -> u32 { 32 }
fn default_shadow_opacity() -> f64 { 0.5 }
fn default_width() -> u32 { 1200 }
fn default_height() -> u32 { 800 }
fn default_min_width() -> u32 { 600 }
fn default_min_height() -> u32 { 400 }
fn default_font_family() -> String { "JetBrains Mono, Fira Code, monospace".to_string() }
fn default_font_fallback() -> String { "monospace".to_string() }
fn default_font_size() -> u32 { 14 }
fn default_font_weight() -> String { "normal".to_string() }
fn default_font_style() -> String { "normal".to_string() }
fn default_scrollback() -> u32 { 10000 }
fn default_noise_opacity() -> f64 { 0.02 }
fn default_saturation() -> u32 { 180 }
fn default_cursor_style() -> String { "block".to_string() }
fn default_blink_interval() -> u32 { 500 }
fn default_cursor_opacity() -> f64 { 1.0 }
fn default_cursor_color() -> String { "#f5e0dc".to_string() }
fn default_text_color() -> String { "#1e1e2e".to_string() }
fn default_selection_bg() -> String { "#313244".to_string() }
fn default_selection_fg() -> String { "#cdd6f4".to_string() }
fn default_tab_height() -> u32 { 36 }
fn default_tab_bar_bg() -> String { "#181825".to_string() }
fn default_border_height() -> u32 { 1 }
fn default_tab_bar_border() -> String { "#313244".to_string() }
fn default_tab_padding() -> u32 { 16 }
fn default_pane_border_width() -> u32 { 1 }
fn default_active_border() -> String { "#94e2d5".to_string() }
fn default_splitter_size() -> u32 { 4 }
fn default_anim_duration() -> u32 { 200 }
fn default_easing() -> String { "ease-out".to_string() }
fn default_new_tab() -> String { "Ctrl+Shift+T".to_string() }
fn default_close_tab() -> String { "Ctrl+Shift+W".to_string() }
fn default_next_tab() -> String { "Ctrl+PageDown".to_string() }
fn default_prev_tab() -> String { "Ctrl+PageUp".to_string() }
fn default_split_horizontal() -> String { "Ctrl+Shift+O".to_string() }
fn default_split_vertical() -> String { "Ctrl+Shift+E".to_string() }
fn default_close_pane() -> String { "Ctrl+Shift+X".to_string() }
fn default_pane_left() -> String { "Ctrl+Shift+ArrowLeft".to_string() }
fn default_pane_right() -> String { "Ctrl+Shift+ArrowRight".to_string() }
fn default_pane_up() -> String { "Ctrl+Shift+ArrowUp".to_string() }
fn default_pane_down() -> String { "Ctrl+Shift+ArrowDown".to_string() }
fn default_copy() -> String { "Ctrl+Shift+C".to_string() }
fn default_paste() -> String { "Ctrl+Shift+V".to_string() }
fn default_search() -> String { "Ctrl+Shift+F".to_string() }
fn default_command_palette() -> String { "Ctrl+Shift+P".to_string() }
fn default_settings() -> String { "Ctrl+Shift+,".to_string() }
fn default_zoom_in() -> String { "Ctrl+Equal".to_string() }
fn default_zoom_out() -> String { "Ctrl+Minus".to_string() }
fn default_zoom_reset() -> String { "Ctrl+0".to_string() }
fn default_payload_palette() -> String { "Ctrl+Shift+B".to_string() }
fn default_recon() -> String { "Ctrl+Shift+R".to_string() }
fn default_quick_terminal() -> String { "Ctrl+graveaccent".to_string() }
fn default_shell_args() -> Vec<String> { vec!["--login".to_string()] }
fn default_shell_env() -> std::collections::HashMap<String, String> {
    let mut env = std::collections::HashMap::new();
    env.insert("TERM".to_string(), "xterm-256color".to_string());
    env.insert("COLORTERM".to_string(), "truecolor".to_string());
    env
}
fn default_theme_name() -> String { "catppuccin-mocha".to_string() }
fn default_visual_bell_duration() -> u32 { 200 }
fn default_bg_image_opacity() -> f64 { 0.2 }
fn default_bg_image_fit() -> String { "cover".to_string() }
fn default_scrollbar_style() -> String { "overlay".to_string() }
fn default_shader_preset() -> String { "none".to_string() }
fn default_shader_fragment() -> String { String::new() }
fn default_shader_intensity() -> f64 { 1.0 }
fn default_shader_speed() -> f64 { 1.0 }

impl PulseConfig {
    pub fn with_defaults() -> Self {
        Self {
            window: WindowConfig {
                opacity: default_opacity(),
                blur_radius: default_blur_radius(),
                border_radius: default_border_radius(),
                border_width: default_border_width(),
                border_color: default_border_color(),
                shadow: default_true(),
                shadow_blur: default_shadow_blur(),
                shadow_opacity: default_shadow_opacity(),
                padding_x: 0,
                padding_y: 0,
                width: default_width(),
                height: default_height(),
                min_width: default_min_width(),
                min_height: default_min_height(),
                decorations: false,
                center: default_true(),
            },
            font: FontConfig {
                family: default_font_family(),
                fallback: default_font_fallback(),
                size: default_font_size(),
                weight: default_font_weight(),
                style: default_font_style(),
                ligatures: default_true(),
                scrollback: default_scrollback(),
                font_features: Vec::new(),
            },
            glass: GlassConfig {
                enabled: default_true(),
                blur_radius: default_blur_radius(),
                noise_opacity: default_noise_opacity(),
                saturation: default_saturation(),
            },
            cursor: CursorConfig {
                style: default_cursor_style(),
                blinking: default_true(),
                blink_interval: default_blink_interval(),
                opacity: default_cursor_opacity(),
                cursor_color: default_cursor_color(),
                text_color: default_text_color(),
            },
            selection: SelectionConfig {
                background: default_selection_bg(),
                foreground: default_selection_fg(),
                copy_on_select: false,
            },
            tab_bar: TabBarConfig {
                height: default_tab_height(),
                background: default_tab_bar_bg(),
                border_height: default_border_height(),
                border_color: default_tab_bar_border(),
                tab_padding_x: default_tab_padding(),
            },
            pane: PaneConfig {
                border_width: default_pane_border_width(),
                border_color: default_border_color(),
                active_border_color: default_active_border(),
                splitter_size: default_splitter_size(),
            },
            animations: AnimationConfig {
                enabled: default_true(),
                duration: default_anim_duration(),
                easing: default_easing(),
            },
            keybindings: KeybindingsConfig::default(),
            shell: ShellConfig::default(),
            theme: ThemeRefConfig { name: default_theme_name() },
            pulse: PulseFeatures {
                visual_bell: false,
                visual_bell_duration: default_visual_bell_duration(),
                command_notifications: default_true(),
                auto_theme_switch: false,
                light_theme: None,
                background_image: None,
                background_image_opacity: default_bg_image_opacity(),
                background_image_fit: default_bg_image_fit(),
                scrollbar: default_true(),
                scrollbar_style: default_scrollbar_style(),
            },
            shader: ShaderConfig::default(),
        }
    }
}

pub fn config_dir() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("~/.config"))
        .join("pulse")
}

pub fn config_path() -> PathBuf {
    config_dir().join(CONFIG_FILE_NAME)
}

pub fn legacy_config_path() -> PathBuf {
    config_dir().join(LEGACY_CONFIG_FILE)
}

/// Load config from TOML file, with migration from legacy JSON
pub fn load_config() -> Result<PulseConfig, String> {
    let toml_path = config_path();
    let legacy_path = legacy_config_path();

    // Try TOML first
    if toml_path.exists() {
        let content = std::fs::read_to_string(&toml_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;
        let config: PulseConfig = toml::from_str(&content)
            .map_err(|e| format!("Failed to parse config.toml: {}", e))?;
        log::info!("Loaded config from {}", toml_path.display());
        return Ok(config);
    }

    // Migrate from legacy JSON
    if legacy_path.exists() {
        log::info!("Migrating from legacy {} to {}", legacy_path.display(), toml_path.display());
        let json_content = std::fs::read_to_string(&legacy_path)
            .map_err(|e| format!("Failed to read legacy config: {}", e))?;

        // Parse as serde_json::Value to extract theme data
        let json_value: serde_json::Value = serde_json::from_str(&json_content)
            .map_err(|e| format!("Failed to parse legacy config: {}", e))?;

        let config = json_value_to_config(&json_value);
        let _ = save_config(&config);
        return Ok(config);
    }

    log::info!("No config file found, using defaults");
    Ok(PulseConfig::with_defaults())
}

/// Save config to TOML file
pub fn save_config(config: &PulseConfig) -> Result<(), String> {
    let dir = config_dir();
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    let content = toml::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    let path = config_path();
    std::fs::write(&path, &content).map_err(|e| e.to_string())?;
    log::info!("Saved config to {}", path.display());
    Ok(())
}

/// Convert legacy JSON theme to PulseConfig
fn json_value_to_config(value: &serde_json::Value) -> PulseConfig {
    let mut config = PulseConfig::with_defaults();

    // Extract window settings
    if let Some(window) = value.get("window") {
        if let Some(v) = window.get("opacity").and_then(|v| v.as_f64()) {
            config.window.opacity = v;
        }
        if let Some(v) = window.get("blurRadius").and_then(|v| v.as_u64()) {
            config.window.blur_radius = v as u32;
        }
        if let Some(v) = window.get("borderRadius").and_then(|v| v.as_u64()) {
            config.window.border_radius = v as u32;
        }
        if let Some(v) = window.get("borderWidth").and_then(|v| v.as_u64()) {
            config.window.border_width = v as u32;
        }
        if let Some(v) = window.get("borderColor").and_then(|v| v.as_str()) {
            config.window.border_color = v.to_string();
        }
        if let Some(v) = window.get("shadow").and_then(|v| v.as_bool()) {
            config.window.shadow = v;
        }
        if let Some(v) = window.get("shadowBlur").and_then(|v| v.as_u64()) {
            config.window.shadow_blur = v as u32;
        }
        if let Some(v) = window.get("shadowOpacity").and_then(|v| v.as_f64()) {
            config.window.shadow_opacity = v;
        }
        if let Some(v) = window.get("paddingX").and_then(|v| v.as_u64()) {
            config.window.padding_x = v as u32;
        }
        if let Some(v) = window.get("paddingY").and_then(|v| v.as_u64()) {
            config.window.padding_y = v as u32;
        }
    }

    // Extract font settings
    if let Some(font) = value.get("font") {
        if let Some(v) = font.get("family").and_then(|v| v.as_str()) {
            config.font.family = v.to_string();
        }
        if let Some(v) = font.get("fallback").and_then(|v| v.as_str()) {
            config.font.fallback = v.to_string();
        }
        if let Some(v) = font.get("size").and_then(|v| v.as_u64()) {
            config.font.size = v as u32;
        }
        if let Some(v) = font.get("weight").and_then(|v| v.as_str()) {
            config.font.weight = v.to_string();
        }
        if let Some(v) = font.get("style").and_then(|v| v.as_str()) {
            config.font.style = v.to_string();
        }
        if let Some(v) = font.get("ligatures").and_then(|v| v.as_bool()) {
            config.font.ligatures = v;
        }
        if let Some(v) = font.get("scrollback").and_then(|v| v.as_u64()) {
            config.font.scrollback = v as u32;
        }
        if let Some(features) = font.get("fontFeatures").and_then(|v| v.as_array()) {
            config.font.font_features = features.iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect();
        }
    }

    // Extract glass settings
    if let Some(glass) = value.get("glass") {
        if let Some(v) = glass.get("enabled").and_then(|v| v.as_bool()) {
            config.glass.enabled = v;
        }
        if let Some(v) = glass.get("blurRadius").and_then(|v| v.as_u64()) {
            config.glass.blur_radius = v as u32;
        }
        if let Some(v) = glass.get("noiseOpacity").and_then(|v| v.as_f64()) {
            config.glass.noise_opacity = v;
        }
        if let Some(v) = glass.get("saturation").and_then(|v| v.as_u64()) {
            config.glass.saturation = v as u32;
        }
    }

    // Extract cursor settings
    if let Some(cursor) = value.get("cursor") {
        if let Some(v) = cursor.get("style").and_then(|v| v.as_str()) {
            config.cursor.style = v.to_string();
        }
        if let Some(v) = cursor.get("blinking").and_then(|v| v.as_bool()) {
            config.cursor.blinking = v;
        }
        if let Some(v) = cursor.get("blinkInterval").and_then(|v| v.as_u64()) {
            config.cursor.blink_interval = v as u32;
        }
        if let Some(v) = cursor.get("opacity").and_then(|v| v.as_f64()) {
            config.cursor.opacity = v;
        }
        if let Some(v) = cursor.get("cursor").and_then(|v| v.as_str()) {
            config.cursor.cursor_color = v.to_string();
        }
        if let Some(v) = cursor.get("text").and_then(|v| v.as_str()) {
            config.cursor.text_color = v.to_string();
        }
    }

    // Extract selection settings
    if let Some(selection) = value.get("selection") {
        if let Some(v) = selection.get("background").and_then(|v| v.as_str()) {
            config.selection.background = v.to_string();
        }
        if let Some(v) = selection.get("foreground").and_then(|v| v.as_str()) {
            config.selection.foreground = v.to_string();
        }
    }

    // Extract tab bar settings
    if let Some(tab_bar) = value.get("tabBar") {
        if let Some(v) = tab_bar.get("height").and_then(|v| v.as_u64()) {
            config.tab_bar.height = v as u32;
        }
        if let Some(v) = tab_bar.get("background").and_then(|v| v.as_str()) {
            config.tab_bar.background = v.to_string();
        }
        if let Some(v) = tab_bar.get("borderHeight").and_then(|v| v.as_u64()) {
            config.tab_bar.border_height = v as u32;
        }
        if let Some(v) = tab_bar.get("borderColor").and_then(|v| v.as_str()) {
            config.tab_bar.border_color = v.to_string();
        }
        if let Some(v) = tab_bar.get("tabPaddingX").and_then(|v| v.as_u64()) {
            config.tab_bar.tab_padding_x = v as u32;
        }
    }

    // Extract pane settings
    if let Some(pane) = value.get("pane") {
        if let Some(v) = pane.get("borderWidth").and_then(|v| v.as_u64()) {
            config.pane.border_width = v as u32;
        }
        if let Some(v) = pane.get("borderColor").and_then(|v| v.as_str()) {
            config.pane.border_color = v.to_string();
        }
        if let Some(v) = pane.get("activeBorderColor").and_then(|v| v.as_str()) {
            config.pane.active_border_color = v.to_string();
        }
        if let Some(v) = pane.get("splitterSize").and_then(|v| v.as_u64()) {
            config.pane.splitter_size = v as u32;
        }
    }

    // Extract animation settings
    if let Some(animations) = value.get("animations") {
        if let Some(v) = animations.get("enabled").and_then(|v| v.as_bool()) {
            config.animations.enabled = v;
        }
        if let Some(v) = animations.get("duration").and_then(|v| v.as_u64()) {
            config.animations.duration = v as u32;
        }
        if let Some(v) = animations.get("easing").and_then(|v| v.as_str()) {
            config.animations.easing = v.to_string();
        }
    }

    // Extract keybindings
    if let Some(kb) = value.get("keybindings") {
        macro_rules! extract_kb {
            ($field:ident, $json_key:expr) => {
                if let Some(v) = kb.get($json_key).and_then(|v| v.as_str()) {
                    config.keybindings.$field = v.to_string();
                }
            };
        }
        extract_kb!(new_tab, "newTab");
        extract_kb!(close_tab, "closeTab");
        extract_kb!(next_tab, "nextTab");
        extract_kb!(prev_tab, "prevTab");
        extract_kb!(split_horizontal, "splitHorizontal");
        extract_kb!(split_vertical, "splitVertical");
        extract_kb!(close_pane, "closePane");
        extract_kb!(pane_left, "paneLeft");
        extract_kb!(pane_right, "paneRight");
        extract_kb!(pane_up, "paneUp");
        extract_kb!(pane_down, "paneDown");
        extract_kb!(copy, "copy");
        extract_kb!(paste, "paste");
        extract_kb!(search, "search");
        extract_kb!(command_palette, "commandPalette");
        extract_kb!(settings, "settings");
        extract_kb!(zoom_in, "zoomIn");
        extract_kb!(zoom_out, "zoomOut");
        extract_kb!(zoom_reset, "zoomReset");
        extract_kb!(payload_palette, "payloadPalette");
        extract_kb!(recon, "recon");
        extract_kb!(quick_terminal, "quickTerminal");
    }

    // Extract pulse features settings
    if let Some(pulse) = value.get("pulse") {
        if let Some(v) = pulse.get("visualBell").and_then(|v| v.as_bool()) {
            config.pulse.visual_bell = v;
        }
        if let Some(v) = pulse.get("visualBellDuration").and_then(|v| v.as_u64()) {
            config.pulse.visual_bell_duration = v as u32;
        }
        if let Some(v) = pulse.get("commandNotifications").and_then(|v| v.as_bool()) {
            config.pulse.command_notifications = v;
        }
        if let Some(v) = pulse.get("autoThemeSwitch").and_then(|v| v.as_bool()) {
            config.pulse.auto_theme_switch = v;
        }
        if let Some(v) = pulse.get("scrollbar").and_then(|v| v.as_bool()) {
            config.pulse.scrollbar = v;
        }
        if let Some(v) = pulse.get("scrollbarStyle").and_then(|v| v.as_str()) {
            config.pulse.scrollbar_style = v.to_string();
        }
    }

    // Extract shader settings
    if let Some(shader) = value.get("shader") {
        if let Some(v) = shader.get("enabled").and_then(|v| v.as_bool()) {
            config.shader.enabled = v;
        }
        if let Some(v) = shader.get("preset").and_then(|v| v.as_str()) {
            config.shader.preset = v.to_string();
        }
        if let Some(v) = shader.get("customFragment").and_then(|v| v.as_str()) {
            config.shader.custom_fragment = v.to_string();
        }
        if let Some(v) = shader.get("intensity").and_then(|v| v.as_f64()) {
            config.shader.intensity = v;
        }
        if let Some(v) = shader.get("speed").and_then(|v| v.as_f64()) {
            config.shader.speed = v;
        }
    }

    config
}

/// Convert PulseConfig back to JSON Theme format for the frontend
pub fn config_to_json_theme(config: &PulseConfig) -> serde_json::Value {
    serde_json::json!({
        "metadata": {
            "name": config.theme.name,
            "author": "Custom",
            "variant": "dark",
            "version": "1.0"
        },
        "palette": {
            "black": "#1e1e2e",
            "red": "#f38ba8",
            "green": "#a6e3a1",
            "yellow": "#f9e2af",
            "blue": "#89b4fa",
            "magenta": "#f5c2e7",
            "cyan": "#94e2d5",
            "white": "#cdd6f4",
            "brightBlack": "#585b70",
            "brightRed": "#f38ba8",
            "brightGreen": "#a6e3a1",
            "brightYellow": "#f9e2af",
            "brightBlue": "#89b4fa",
            "brightMagenta": "#f5c2e7",
            "brightCyan": "#94e2d5",
            "brightWhite": "#cdd6f4",
            "peach": "#fab387",
            "teal": "#94e2d5",
            "mauve": "#cba6f7",
            "pink": "#f5c2e7"
        },
        "background": "#1e1e2e",
        "foreground": "#cdd6f4",
        "cursor": {
            "text": config.cursor.text_color,
            "cursor": config.cursor.cursor_color,
            "style": config.cursor.style,
            "opacity": config.cursor.opacity,
            "blinking": config.cursor.blinking,
            "blinkInterval": config.cursor.blink_interval
        },
        "selection": {
            "background": config.selection.background,
            "foreground": config.selection.foreground
        },
        "window": {
            "opacity": config.window.opacity,
            "blurRadius": config.window.blur_radius,
            "borderRadius": config.window.border_radius,
            "borderWidth": config.window.border_width,
            "borderColor": config.window.border_color,
            "shadow": config.window.shadow,
            "shadowBlur": config.window.shadow_blur,
            "shadowOpacity": config.window.shadow_opacity,
            "paddingX": config.window.padding_x,
            "paddingY": config.window.padding_y
        },
        "font": {
            "family": config.font.family,
            "fallback": config.font.fallback,
            "size": config.font.size,
            "weight": config.font.weight,
            "style": config.font.style,
            "ligatures": config.font.ligatures,
            "scrollback": config.font.scrollback,
            "fontFeatures": config.font.font_features
        },
        "glass": {
            "enabled": config.glass.enabled,
            "blurRadius": config.glass.blur_radius,
            "noiseOpacity": config.glass.noise_opacity,
            "saturation": config.glass.saturation
        },
        "animations": {
            "enabled": config.animations.enabled,
            "duration": config.animations.duration,
            "easing": config.animations.easing
        },
        "tabBar": {
            "height": config.tab_bar.height,
            "background": config.tab_bar.background,
            "borderHeight": config.tab_bar.border_height,
            "borderColor": config.tab_bar.border_color,
            "tabPaddingX": config.tab_bar.tab_padding_x
        },
        "pane": {
            "borderWidth": config.pane.border_width,
            "borderColor": config.pane.border_color,
            "activeBorderColor": config.pane.active_border_color,
            "splitterSize": config.pane.splitter_size
        },
        "keybindings": {
            "newTab": config.keybindings.new_tab,
            "closeTab": config.keybindings.close_tab,
            "nextTab": config.keybindings.next_tab,
            "prevTab": config.keybindings.prev_tab,
            "splitHorizontal": config.keybindings.split_horizontal,
            "splitVertical": config.keybindings.split_vertical,
            "closePane": config.keybindings.close_pane,
            "paneLeft": config.keybindings.pane_left,
            "paneRight": config.keybindings.pane_right,
            "paneUp": config.keybindings.pane_up,
            "paneDown": config.keybindings.pane_down,
            "copy": config.keybindings.copy,
            "paste": config.keybindings.paste,
            "search": config.keybindings.search,
            "commandPalette": config.keybindings.command_palette,
            "settings": config.keybindings.settings,
            "zoomIn": config.keybindings.zoom_in,
            "zoomOut": config.keybindings.zoom_out,
            "zoomReset": config.keybindings.zoom_reset,
            "payloadPalette": config.keybindings.payload_palette,
            "recon": config.keybindings.recon,
            "quickTerminal": config.keybindings.quick_terminal
        },
        "pulse": {
            "visualBell": config.pulse.visual_bell,
            "visualBellDuration": config.pulse.visual_bell_duration,
            "commandNotifications": config.pulse.command_notifications,
            "autoThemeSwitch": config.pulse.auto_theme_switch,
            "lightTheme": config.pulse.light_theme,
            "backgroundImage": config.pulse.background_image,
            "backgroundImageOpacity": config.pulse.background_image_opacity,
            "backgroundImageFit": config.pulse.background_image_fit,
            "scrollbar": config.pulse.scrollbar,
            "scrollbarStyle": config.pulse.scrollbar_style
        },
        "shader": {
            "enabled": config.shader.enabled,
            "preset": config.shader.preset,
            "customFragment": config.shader.custom_fragment,
            "intensity": config.shader.intensity,
            "speed": config.shader.speed
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_config() -> PulseConfig {
        let mut config = PulseConfig::with_defaults();
        config.cursor.cursor_color = "#ff0000".to_string();
        config.cursor.text_color = "#00ff00".to_string();
        config.window.opacity = 0.42;
        config.glass.enabled = false;
        config.keybindings.new_tab = "Ctrl+Alt+T".to_string();
        config.pulse.auto_theme_switch = true;
        config
    }

    #[test]
    fn defaults_are_sane() {
        let config = PulseConfig::with_defaults();
        assert_eq!(config.theme.name, "catppuccin-mocha");
        assert!(config.glass.enabled);
        assert_eq!(config.font.size, 14);
        assert_eq!(config.cursor.style, "block");
        assert_eq!(config.keybindings.new_tab, "Ctrl+Shift+T");
        assert_eq!(config.shader.preset, "none");
    }

    #[test]
    fn config_to_json_preserves_custom_values() {
        let json = config_to_json_theme(&sample_config());
        assert_eq!(json["cursor"]["cursor"], "#ff0000");
        assert_eq!(json["cursor"]["text"], "#00ff00");
        assert!((json["window"]["opacity"].as_f64().unwrap() - 0.42).abs() < 1e-9);
        assert_eq!(json["glass"]["enabled"], false);
        assert_eq!(json["keybindings"]["newTab"], "Ctrl+Alt+T");
        assert_eq!(json["pulse"]["autoThemeSwitch"], true);
    }

    #[test]
    fn config_to_json_outputs_full_schema() {
        let json = config_to_json_theme(&PulseConfig::with_defaults());
        for key in [
            "metadata",
            "palette",
            "background",
            "foreground",
            "cursor",
            "selection",
            "window",
            "font",
            "glass",
            "animations",
            "tabBar",
            "pane",
            "keybindings",
            "pulse",
            "shader",
        ] {
            assert!(json.get(key).is_some(), "missing top-level key: {}", key);
        }
        for key in [
            "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
            "brightBlack", "brightRed", "brightGreen", "brightYellow", "brightBlue",
            "brightMagenta", "brightCyan", "brightWhite",
        ] {
            assert!(json["palette"].get(key).is_some(), "missing palette key: {}", key);
            assert!(
                json["palette"][key].as_str().unwrap().starts_with('#'),
                "palette color not hex: {}",
                key
            );
        }
    }

    #[test]
    fn shader_defaults_round_trip() {
        let json = config_to_json_theme(&PulseConfig::with_defaults());
        assert_eq!(json["shader"]["preset"], "none");
        assert_eq!(json["shader"]["enabled"], false);
        assert_eq!(json["shader"]["intensity"], 1.0);
    }

    #[test]
    fn toml_round_trip_preserves_fields() {
        let config = sample_config();
        let content = toml::to_string_pretty(&config).unwrap();
        let parsed: PulseConfig = toml::from_str(&content).unwrap();
        assert_eq!(parsed.cursor.cursor_color, "#ff0000");
        assert_eq!(parsed.keybindings.new_tab, "Ctrl+Alt+T");
        assert_eq!(parsed.theme.name, "catppuccin-mocha");
        assert_eq!(parsed.font.size, 14);
    }
}
