import { describe, it, expect } from 'vitest';
import { builtInThemes } from './index';

const REQUIRED_PALETTE_KEYS = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
] as const;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

describe('built-in themes', () => {
  it('contains exactly 7 themes', () => {
    expect(Object.keys(builtInThemes).sort()).toEqual(
      [
        'catppuccin-mocha',
        'catppuccin-latte',
        'dracula',
        'tokyo-night',
        'nord',
        'gruvbox',
        'ghostty',
      ].sort()
    );
  });

  it('every theme has all 16 required palette colors as valid hex', () => {
    for (const [id, theme] of Object.entries(builtInThemes)) {
      for (const key of REQUIRED_PALETTE_KEYS) {
        expect(theme.palette[key], `${id}.palette.${key}`).toMatch(HEX_COLOR);
      }
    }
  });

  it('every theme has a background and foreground as valid hex', () => {
    for (const [id, theme] of Object.entries(builtInThemes)) {
      expect(theme.background, `${id}.background`).toMatch(HEX_COLOR);
      expect(theme.foreground, `${id}.foreground`).toMatch(HEX_COLOR);
    }
  });

  it('theme metadata name stays consistent with its key', () => {
    expect(builtInThemes['catppuccin-mocha'].metadata.name).toBe('Catppuccin Mocha');
    expect(builtInThemes['ghostty'].metadata.name).toBe('Ghostty');
  });

  it('only catppuccin-latte is a light variant', () => {
    for (const [id, theme] of Object.entries(builtInThemes)) {
      const expected = id === 'catppuccin-latte' ? 'light' : 'dark';
      expect(theme.metadata.variant, id).toBe(expected);
    }
  });

  it('every theme carries a cursor block with valid colors', () => {
    for (const [id, theme] of Object.entries(builtInThemes)) {
      expect(theme.cursor.cursor, `${id}.cursor.cursor`).toMatch(HEX_COLOR);
      expect(theme.cursor.text, `${id}.cursor.text`).toMatch(HEX_COLOR);
    }
  });

  it('optional palette accents use valid hex when present', () => {
    for (const [id, theme] of Object.entries(builtInThemes)) {
      for (const key of ['peach', 'teal', 'mauve', 'pink'] as const) {
        const value = theme.palette[key];
        if (value !== undefined) {
          expect(value, `${id}.palette.${key}`).toMatch(HEX_COLOR);
        }
      }
    }
  });
});