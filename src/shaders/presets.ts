import type { ShaderPreset } from '../types/theme';

export const shaderPresets: ShaderPreset[] = [
  {
    id: 'none',
    name: 'None',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
void main() {
  gl_FragColor = texture2D(uTexture, vUv);
}`,
  },
  {
    id: 'scanlines',
    name: 'Scanlines',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
uniform float uTime;
void main() {
  vec4 color = texture2D(uTexture, vUv);
  float scanline = sin(vUv.y * 800.0 + uTime * 2.0) * 0.5 + 0.5;
  scanline = mix(1.0, scanline, uIntensity * 0.3);
  color.rgb *= scanline;
  gl_FragColor = color;
}`,
    uniforms: { uIntensity: 1.0 },
  },
  {
    id: 'crt',
    name: 'CRT',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
uniform float uTime;
void main() {
  vec2 uv = vUv;
  vec2 center = uv - 0.5;
  float dist = length(center);
  uv += center * dist * dist * uIntensity * 0.15;
  float scanline = sin(uv.y * 600.0) * 0.5 + 0.5;
  scanline = mix(1.0, scanline, uIntensity * 0.2);
  float vignette = 1.0 - dist * 1.2;
  vignette = clamp(vignette, 0.0, 1.0);
  vec4 color = texture2D(uTexture, uv);
  color.rgb *= scanline * mix(1.0, vignette, uIntensity * 0.5);
  color.r *= 1.0 + sin(uv.y * 300.0) * uIntensity * 0.02;
  color.b *= 1.0 - sin(uv.y * 300.0) * uIntensity * 0.02;
  gl_FragColor = color;
}`,
    uniforms: { uIntensity: 1.0 },
  },
  {
    id: 'glow',
    name: 'Glow',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
uniform vec2 uResolution;
void main() {
  vec4 color = vec4(0.0);
  float blur = uIntensity * 2.0;
  vec2 texelSize = 1.0 / uResolution;
  for(float x = -2.0; x <= 2.0; x += 1.0) {
    for(float y = -2.0; y <= 2.0; y += 1.0) {
      vec2 offset = vec2(x, y) * texelSize * blur;
      color += texture2D(uTexture, vUv + offset);
    }
  }
  color /= 25.0;
  vec4 original = texture2D(uTexture, vUv);
  gl_FragColor = original + color * uIntensity * 0.5;
}`,
    uniforms: { uIntensity: 0.5 },
  },
  {
    id: 'vignette',
    name: 'Vignette',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
void main() {
  vec4 color = texture2D(uTexture, vUv);
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float vignette = 1.0 - dist * 1.5 * uIntensity;
  vignette = clamp(vignette, 0.0, 1.0);
  vignette = smoothstep(0.0, 1.0, vignette);
  color.rgb *= vignette;
  gl_FragColor = color;
}`,
    uniforms: { uIntensity: 0.8 },
  },
  {
    id: 'chromatic',
    name: 'Chromatic Aberration',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);
  float offset = dist * uIntensity * 0.01;
  float r = texture2D(uTexture, vUv + center * offset).r;
  float g = texture2D(uTexture, vUv).g;
  float b = texture2D(uTexture, vUv - center * offset).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`,
    uniforms: { uIntensity: 1.0 },
  },
  {
    id: 'noise',
    name: 'Film Grain',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
uniform float uTime;
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
  vec4 color = texture2D(uTexture, vUv);
  float noise = rand(vUv + uTime) * uIntensity * 0.15;
  color.rgb += noise - uIntensity * 0.075;
  gl_FragColor = color;
}`,
    uniforms: { uIntensity: 1.0 },
  },
  {
    id: 'pixelate',
    name: 'Pixelate',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
uniform vec2 uResolution;
void main() {
  float pixels = mix(1.0, 40.0, uIntensity);
  vec2 pixelSize = vec2(pixels) / uResolution;
  vec2 coord = floor(vUv / pixelSize) * pixelSize + pixelSize * 0.5;
  gl_FragColor = texture2D(uTexture, coord);
}`,
    uniforms: { uIntensity: 0.3 },
  },
  {
    id: 'rgbshift',
    name: 'RGB Split',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
void main() {
  float amount = uIntensity * 0.008;
  float r = texture2D(uTexture, vUv + vec2(amount, 0.0)).r;
  float g = texture2D(uTexture, vUv).g;
  float b = texture2D(uTexture, vUv - vec2(amount, 0.0)).b;
  float a = texture2D(uTexture, vUv).a;
  gl_FragColor = vec4(r, g, b, a);
}`,
    uniforms: { uIntensity: 1.0 },
  },
  {
    id: 'blur',
    name: 'Gaussian Blur',
    fragment: `precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uIntensity;
uniform vec2 uResolution;
void main() {
  vec2 texelSize = 1.0 / uResolution;
  vec4 result = vec4(0.0);
  float weight[5];
  weight[0] = 0.227027;
  weight[1] = 0.1945946;
  weight[2] = 0.1216216;
  weight[3] = 0.054054;
  weight[4] = 0.016216;
  result += texture2D(uTexture, vUv) * weight[0];
  for(float i = 1.0; i < 5.0; i += 1.0) {
    result += texture2D(uTexture, vUv + vec2(texelSize.x * i, 0.0) * uIntensity) * weight[int(i)];
    result += texture2D(uTexture, vUv - vec2(texelSize.x * i, 0.0) * uIntensity) * weight[int(i)];
    result += texture2D(uTexture, vUv + vec2(0.0, texelSize.y * i) * uIntensity) * weight[int(i)];
    result += texture2D(uTexture, vUv - vec2(0.0, texelSize.y * i) * uIntensity) * weight[int(i)];
  }
  gl_FragColor = result;
}`,
    uniforms: { uIntensity: 1.0 },
  },
];
