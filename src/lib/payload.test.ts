import { describe, it, expect } from 'vitest';
import { substituteVars } from './payload';

describe('substituteVars', () => {
  it('substitutes all three placeholders with provided values', () => {
    const result = substituteVars(
      'nc -lvnp {LPORT}; host={LHOST}; target={TARGET}',
      '10.0.0.5',
      '9001',
      'example.org'
    );
    expect(result).toBe('nc -lvnp 9001; host=10.0.0.5; target=example.org');
  });

  it('applies default LHOST when left empty', () => {
    expect(substituteVars('{LHOST}', '', '4444', 'example.com')).toBe('127.0.0.1');
  });

  it('applies default LPORT when left empty', () => {
    expect(substituteVars('{LPORT}', '127.0.0.1', '', 'example.com')).toBe('4444');
  });

  it('applies default TARGET when left empty', () => {
    expect(substituteVars('{TARGET}', '127.0.0.1', '4444', '')).toBe('example.com');
  });

  it('replaces every occurrence, not just the first', () => {
    expect(substituteVars('{LPORT} {LPORT}', 'x', '8080', 'x')).toBe('8080 8080');
  });

  it('leaves unmatched placeholders untouched', () => {
    expect(substituteVars('echo {FOO}; nc {LPORT}', 'a', '7777', 'b')).toBe(
      'echo {FOO}; nc 7777'
    );
  });

  it('handles content with no placeholders', () => {
    expect(substituteVars('ps aux', 'a', 'b', 'c')).toBe('ps aux');
  });
});