import { useState, useRef, useCallback } from 'react';
import { shaderPresets } from '../shaders/presets';
import type { ShaderConfig } from '../types/theme';

interface ShaderEditorProps {
  config: ShaderConfig;
  onChange: (config: ShaderConfig) => void;
}

export function ShaderEditor({ config, onChange }: ShaderEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetChange = useCallback((presetId: string) => {
    const preset = shaderPresets.find(p => p.id === presetId);
    if (preset) {
      onChange({ ...config, preset: presetId, customFragment: preset.fragment });
      setError(null);
    }
  }, [config, onChange]);

  const handleFragmentChange = useCallback((fragment: string) => {
    onChange({ ...config, customFragment: fragment, preset: 'custom' });
    setError(null);
  }, [config, onChange]);

  const handleLoadFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      if (!text.includes('gl_FragColor') && !text.includes('void main')) {
        setError('Invalid GLSL: must contain void main() and gl_FragColor');
        return;
      }
      onChange({ ...config, customFragment: text, preset: 'custom' });
      setError(null);
    } catch {
      setError('Failed to read file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [config, onChange]);

  const handleSaveFile = useCallback(() => {
    const blob = new Blob([config.customFragment], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-shader-${config.preset}.glsl`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const currentPreset = shaderPresets.find(p => p.id === config.preset);

  return (
    <div className="shader-editor">
      <div className="shader-presets">
        {shaderPresets.map(preset => (
          <button
            key={preset.id}
            className={`shader-preset-btn ${config.preset === preset.id ? 'active' : ''}`}
            onClick={() => handlePresetChange(preset.id)}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="shader-actions">
        <button className="shader-action-btn" onClick={() => fileInputRef.current?.click()}>
          Load .glsl
        </button>
        <button className="shader-action-btn" onClick={handleSaveFile} disabled={config.preset === 'none'}>
          Save .glsl
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".glsl,.frag,.glslf"
        style={{ display: 'none' }}
        onChange={handleLoadFile}
      />

      {config.preset !== 'none' && (
        <div className="shader-intensity">
          <span className="shader-intensity-label">Intensity</span>
          <input
            type="range"
            className="shader-intensity-slider"
            min={0}
            max={2}
            step={0.05}
            value={config.intensity}
            onChange={(e) => onChange({ ...config, intensity: Number(e.target.value) })}
          />
          <span className="shader-intensity-value">{config.intensity.toFixed(2)}</span>
        </div>
      )}

      {config.preset !== 'none' && (
        <div className="shader-intensity">
          <span className="shader-intensity-label">Speed</span>
          <input
            type="range"
            className="shader-intensity-slider"
            min={0}
            max={3}
            step={0.1}
            value={config.speed}
            onChange={(e) => onChange({ ...config, speed: Number(e.target.value) })}
          />
          <span className="shader-intensity-value">{config.speed.toFixed(1)}x</span>
        </div>
      )}

      {config.preset === 'custom' && (
        <textarea
          className="shader-code"
          value={config.customFragment}
          onChange={(e) => handleFragmentChange(e.target.value)}
          spellCheck={false}
          placeholder={`precision mediump float;\nvarying vec2 vUv;\nuniform sampler2D uTexture;\n\nvoid main() {\n  gl_FragColor = texture2D(uTexture, vUv);\n}`}
        />
      )}

      {error && <div className="shader-error">{error}</div>}
    </div>
  );
}
