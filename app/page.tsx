"use client";
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { useState } from 'react';
import Model3D from './CreditCard3D'
import { Bloom, EffectComposer, Noise } from '@react-three/postprocessing';

interface MaterialControls {
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
  color: string;
  bloom: number;
}

interface LightControls {
  ambient: number;
  directional: number;
}

export default function Page() {
  const [materialProps, setMaterialProps] = useState<MaterialControls>({
    metalness: 0.74,
    roughness: 0.17,
    clearcoat: 0.36,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.0,
    color: '#356DA0', // Blue status default
    bloom: 2
  });

  const [lightProps, setLightProps] = useState<LightControls>({
    ambient: 2.0,
    directional: 2.0,
  });

  const [bloom, setBloom] = useState(2);
  const [luminanceThreshold, setLuminanceThreshold] = useState(0.5);
  const [luminanceSmoothing, setLuminanceSmoothing] = useState(0.9);

  // Status options
  const statusOptions = [
    { name: 'Blue Member', color: '#588bbb' },
    { name: 'Silver Elite Status', color: '#a7abae' },
    { name: 'Gold Elite Status', color: '#b49150' },
    { name: 'Platinum Elite Status', color: '#576C81' },
    { name: 'Obsidian Status', color: '#272532' },
  ];
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);

  // Update material color when status changes
  const handleStatusChange = (status: { name: string; color: string }) => {
    setSelectedStatus(status);
    setMaterialProps(prev => ({
      ...prev,
      color: status.color
    }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Color changed to:', e.target.value);
    setMaterialProps(prev => ({
      ...prev,
      color: e.target.value
    }));
  };

  const [dragging, setDragging] = useState(false);

  return (
    <div id="canvas-container" style={{ width: '100vw', height: '100vh', cursor: dragging ? 'grabbing' : 'grab', position: 'relative' }}>
      {/* Custom slider styles */}
      <style>{`
        .mini-slider {
          width: 100%;
          height: 12px;
          margin: 0;
          padding: 0;
          background: transparent;
        }
        .mini-slider::-webkit-slider-runnable-track {
          height: 6px;
          background: #fff;
          border-radius: 3px;
        }
        .mini-slider::-webkit-slider-thumb {
          width: 10px;
          height: 10px;
          background: #222;
          border-radius: 50%;
          border: 2px solid #444;
          margin-top: -4px;
          cursor: pointer;
        }
        .mini-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          background: #222;
          border-radius: 50%;
          border: 2px solid #444;
          cursor: pointer;
        }
        .mini-slider::-ms-thumb {
          width: 10px;
          height: 10px;
          background: #222;
          border-radius: 50%;
          border: 2px solid #444;
          cursor: pointer;
        }
        .mini-slider::-ms-fill-lower {
          background: #222;
        }
        .mini-slider::-ms-fill-upper {
          background: #fff;
        }
        .mini-slider::-moz-range-track {
          height: 6px;
          background: #fff;
          border-radius: 3px;
        }
        .mini-slider::-moz-range-progress {
          background-color: #222;
          height: 6px;
          border-radius: 3px;
        }
        .mini-slider:focus {
          outline: none;
        }
        .mini-slider::-webkit-slider-thumb {
          box-shadow: 0 0 2px #0003;
        }
        input[type='range'].mini-slider {
          height: 12px;
        }
      `}</style>
      <Canvas camera={{ position: [0, 0, 50], fov: 50 }} shadows>
        <color attach="background" args={['#101010']} />
        <ambientLight intensity={lightProps.ambient} />
        <directionalLight position={[5, 5, 5]} intensity={lightProps.directional} castShadow />
        <Environment preset="city" />
        <Model3D materialProps={materialProps} statusName={selectedStatus.name} dragging={dragging} setDragging={setDragging} />
        <OrbitControls 
          enablePan={false}
          enableRotate={false}
          minDistance={20}
          maxDistance={100}
        />
        <EffectComposer>
          <Bloom
            intensity={bloom} 
            luminanceThreshold={luminanceThreshold}
            luminanceSmoothing={luminanceSmoothing}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'sans-serif',
        width: '280px',
        zIndex: 1000,
        fontSize: '11px',
      }}>
        {/* Segmented control for status */}
        <div style={{ display: 'flex', marginBottom: '12px', gap: '4px' }}>
          {statusOptions.map(option => (
            <button
              key={option.name}
              onClick={() => handleStatusChange(option)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '6px',
                border: selectedStatus.name === option.name ? '2px solid #fff' : '1px solid #444',
                background: selectedStatus.name === option.name ? option.color : 'transparent',
                color: selectedStatus.name === option.name ? '#222' : '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 'bold' }}>Material Controls</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '3px', fontSize: '11px' }}>
            Color: {materialProps.color}
          </label>
          <input
            type="color"
            value={materialProps.color}
            onChange={handleColorChange}
            style={{ width: '100%', height: '18px', padding: 0, border: 'none' }}
          />
        </div>
        {Object.entries(materialProps).map(([key, value]) => (
          key !== 'color' && (
            <div key={key} style={{ marginBottom: '6px' }}>
              <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px' }}>
                {key}: {value.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => setMaterialProps(prev => ({
                  ...prev,
                  [key]: parseFloat(e.target.value)
                }))}
                className="mini-slider"
              />
            </div>
          )
        ))}

        <h3 style={{ margin: '14px 0 10px 0', fontSize: '11px', fontWeight: 'bold' }}>Light Controls</h3>
        <div style={{ marginBottom: '6px' }}>
          <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px' }}>
            Ambient Light: {lightProps.ambient.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={lightProps.ambient}
            onChange={(e) => setLightProps(prev => ({
              ...prev,
              ambient: parseFloat(e.target.value)
            }))}
            className="mini-slider"
          />
        </div>
        <div style={{ marginBottom: '6px' }}>
          <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px' }}>
            Directional Light: {lightProps.directional.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={lightProps.directional}
            onChange={(e) => setLightProps(prev => ({
              ...prev,
              directional: parseFloat(e.target.value)
            }))}
            className="mini-slider"
          />
        </div>

        <h3 style={{ margin: '14px 0 10px 0', fontSize: '11px', fontWeight: 'bold' }}>Postprocessing</h3>
        <div style={{ marginBottom: '6px' }}>
          <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px' }}>
            Bloom: {bloom.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={bloom}
            onChange={e => setBloom(parseFloat(e.target.value))}
            className="mini-slider"
          />
        </div>
        <div style={{ marginBottom: '6px' }}>
          <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px' }}>
            Bloom Luminance Threshold: {luminanceThreshold.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={luminanceThreshold}
            onChange={e => setLuminanceThreshold(parseFloat(e.target.value))}
            className="mini-slider"
          />
        </div>
        <div style={{ marginBottom: '6px' }}>
          <label style={{ display: 'block', marginBottom: '2px', fontSize: '11px' }}>
            Bloom Luminance Smoothing: {luminanceSmoothing.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={luminanceSmoothing}
            onChange={e => setLuminanceSmoothing(parseFloat(e.target.value))}
            className="mini-slider"
          />
        </div>
      </div>
    </div>
  )
}
