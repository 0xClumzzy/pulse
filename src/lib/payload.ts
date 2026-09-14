export function substituteVars(
  s: string,
  lhost: string,
  lport: string,
  target: string
): string {
  return s
    .replace(/\{LHOST\}/g, lhost || '127.0.0.1')
    .replace(/\{LPORT\}/g, lport || '4444')
    .replace(/\{TARGET\}/g, target || 'example.com');
}