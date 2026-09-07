import type { ShaderConfig } from '../types/theme';
import { shaderPresets } from './presets';

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vUv;
  void main() {
    vUv = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

export class ShaderEngine {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private startTime: number = Date.now();
  private animFrame: number = 0;
  private config: ShaderConfig = { enabled: false, preset: 'none', customFragment: '', intensity: 1.0, speed: 1.0 };
  private sourceCanvas: HTMLCanvasElement | null = null;

  init(canvas: HTMLCanvasElement, sourceCanvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.sourceCanvas = sourceCanvas;
    this.gl = canvas.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!this.gl) return;

    const gl = this.gl;

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), gl.STATIC_DRAW);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.compileShader(this.getFragmentSource());
  }

  private getFragmentSource(): string {
    if (this.config.preset === 'custom') {
      return this.config.customFragment;
    }
    const preset = shaderPresets.find(p => p.id === this.config.preset);
    return preset?.fragment || shaderPresets[0].fragment;
  }

  private compileShader(fragmentSource: string) {
    const gl = this.gl;
    if (!gl) return;

    if (this.program) gl.deleteProgram(this.program);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, VERTEX_SHADER);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compile error:', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program));
      return;
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  updateConfig(config: ShaderConfig) {
    const needsRecompile = config.preset !== this.config.preset ||
      (config.preset === 'custom' && config.customFragment !== this.config.customFragment);
    this.config = config;
    if (needsRecompile) {
      this.compileShader(this.getFragmentSource());
    }
  }

  resize(width: number, height: number) {
    if (this.canvas && this.gl) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  render() {
    const gl = this.gl;
    if (!gl || !this.program || !this.canvas || !this.sourceCanvas) return;

    if (!this.config.enabled || this.config.preset === 'none') {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    const posLoc = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    const texLoc = gl.getAttribLocation(this.program, 'aTexCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceCanvas);

    const timeLoc = gl.getUniformLocation(this.program, 'uTime');
    if (timeLoc) gl.uniform1f(timeLoc, (Date.now() - this.startTime) / 1000.0 * this.config.speed);

    const intensityLoc = gl.getUniformLocation(this.program, 'uIntensity');
    if (intensityLoc) gl.uniform1f(intensityLoc, this.config.intensity);

    const resLoc = gl.getUniformLocation(this.program, 'uResolution');
    if (resLoc) gl.uniform2f(resLoc, this.canvas.width, this.canvas.height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  startLoop() {
    const loop = () => {
      this.render();
      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    cancelAnimationFrame(this.animFrame);
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
  }
}
