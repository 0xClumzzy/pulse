export interface ThemeMetadata {
  name: string;
  author: string;
  variant: 'dark' | 'light';
  version: string;
}

export interface Palette {
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
  peach?: string;
  teal?: string;
  mauve?: string;
  pink?: string;
}

export interface CursorConfig {
  text: string;
  cursor: string;
  style: 'block' | 'bar' | 'underline';
  opacity: number;
  blinking: boolean;
  blinkInterval: number;
}

export interface WindowConfig {
  opacity: number;
  blurRadius: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadow: boolean;
  shadowBlur: number;
  shadowOpacity: number;
  paddingX: number;
  paddingY: number;
}

export interface FontConfig {
  family: string;
  fallback: string;
  size: number;
  weight: string;
  style: string;
  ligatures: boolean;
  scrollback: number;
  fontFeatures: string[];
}

export interface GlassConfig {
  enabled: boolean;
  blurRadius: number;
  noiseOpacity: number;
  saturation: number;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
}

export interface TabBarConfig {
  height: number;
  background: string;
  borderHeight: number;
  borderColor: string;
  tabPaddingX: number;
}

export interface PaneConfig {
  borderWidth: number;
  borderColor: string;
  activeBorderColor: string;
  splitterSize: number;
}

export interface Keybindings {
  newTab: string;
  closeTab: string;
  nextTab: string;
  prevTab: string;
  splitHorizontal: string;
  splitVertical: string;
  closePane: string;
  paneLeft: string;
  paneRight: string;
  paneUp: string;
  paneDown: string;
  copy: string;
  paste: string;
  search: string;
  commandPalette: string;
  settings: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
  payloadPalette: string;
  recon: string;
  quickTerminal: string;
}

export interface ReconSummary {
  credentials_found: number;
  commands_executed: number;
  connections_opened: number;
  total_sessions: number;
}

export interface Theme {
  metadata: ThemeMetadata;
  palette: Palette;
  background: string;
  foreground: string;
  cursor: CursorConfig;
  selection: { background: string; foreground: string };
  window: WindowConfig;
  font: FontConfig;
  glass: GlassConfig;
  animations: AnimationConfig;
  tabBar: TabBarConfig;
  pane: PaneConfig;
  keybindings: Keybindings;
  pulse: PulseFeatures;
  shader?: ShaderConfig;
}

export interface PulseFeatures {
  visualBell: boolean;
  visualBellDuration: number;
  commandNotifications: boolean;
  autoThemeSwitch: boolean;
  lightTheme?: string;
  backgroundImage?: string;
  backgroundImageOpacity: number;
  backgroundImageFit: 'contain' | 'cover' | 'stretch';
  scrollbar: boolean;
  scrollbarStyle: 'auto' | 'overlay' | 'always';
}

export interface ShaderPreset {
  id: string;
  name: string;
  fragment: string;
  uniforms?: Record<string, number>;
}

export interface ShaderConfig {
  enabled: boolean;
  preset: string;
  customFragment: string;
  intensity: number;
  speed: number;
}
