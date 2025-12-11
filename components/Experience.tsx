import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import TreeParticles from './TreeParticles';
import { useStore } from '../store';
import { AppMode } from '../types';

const CameraController = () => {
  const { cameraRotationTarget, mode } = useStore();
  const ref = useRef({ rotation: 0 });

  useFrame((state) => {
    const camera = state.camera;
    
    // Smoothly rotate camera based on hand position if in SCATTER mode
    if (mode === AppMode.SCATTER) {
        // Interpolate current rotation target
        ref.current.rotation = THREE.MathUtils.lerp(ref.current.rotation, cameraRotationTarget, 0.05);
        
        // Convert scalar rotation to circular orbit
        const radius = 25;
        const x = Math.sin(ref.current.rotation) * radius;
        const z = Math.cos(ref.current.rotation) * radius;
        
        camera.position.lerp(new THREE.Vector3(x, 5, z), 0.05);
        camera.lookAt(0, 0, 0);
    } else if (mode === AppMode.TREE) {
        camera.position.lerp(new THREE.Vector3(0, 0, 30), 0.05);
        camera.lookAt(0, 0, 0);
    } else if (mode === AppMode.ZOOM) {
        // Camera stays relatively still, object comes to camera
        camera.position.lerp(new THREE.Vector3(0, 0, 20), 0.05);
        camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

const Experience: React.FC = () => {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 30], fov: 50 }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
    >
      <color attach="background" args={['#020403']} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#FFD700" />
      
      {/* Lighting for "Golden & Magnificent" look */}
      <ambientLight intensity={0.5} color="#0f3b1e" />
      <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} color="#FFD700" castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#8a0303" />
      <pointLight position={[0, 10, 0]} intensity={1.5} color="#ffffff" />

      <TreeParticles />
      <CameraController />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
      
      {/* Controls only for debug/mouse fallback, restricted to not interfere too much */}
      <OrbitControls enableZoom={false} enablePan={false} enabled={false} />
    </Canvas>
  );
};

export default Experience;