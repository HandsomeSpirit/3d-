import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useTexture, Box, Sphere, Cylinder, Float, Image as DreiImage } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { AppMode, ParticleData } from '../types';

interface ParticleMeshProps {
  data: ParticleData;
  mode: AppMode;
  focusedId: string | null;
}

const ParticleMesh: React.FC<ParticleMeshProps> = ({ data, mode, focusedId }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Materials
  const materialParams = useMemo(() => {
    if (data.type === 'sphere' && data.color === '#F0F0F0') {
        // Ornaments (White/Silver)
        return { color: data.color, roughness: 0.1, metalness: 0.9, emissive: '#111111' };
    }
    if (data.color === '#FFD700') { // Gold
        return { color: data.color, roughness: 0.2, metalness: 1.0, emissive: '#332200' };
    }
    if (data.color === '#0f3b1e') { // Matte Green
        return { color: data.color, roughness: 0.8, metalness: 0.1 };
    }
    return { color: data.color, roughness: 0.5, metalness: 0.5 };
  }, [data.color, data.type]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    let targetPos = new THREE.Vector3();
    let targetScale = data.scale;

    if (mode === AppMode.TREE) {
      targetPos.set(...data.treePosition);
    } else if (mode === AppMode.SCATTER) {
      targetPos.set(...data.scatterPosition);
      // Add gentle floating
      targetPos.y += Math.sin(state.clock.elapsedTime + data.id.charCodeAt(0)) * 0.02;
    } else if (mode === AppMode.ZOOM) {
      if (focusedId === data.id) {
        // Bring to front
        targetPos.set(0, 0, 8); 
        targetScale = 5; 
        // Look at camera handled by component
      } else {
        // Push others back and spread
        targetPos.set(...data.scatterPosition);
        targetPos.multiplyScalar(1.5); // Push further out
      }
    }

    // Smooth lerp
    meshRef.current.position.lerp(targetPos, 0.05);
    
    // Smooth Scale
    const currentScale = meshRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    meshRef.current.scale.setScalar(nextScale);
    
    // Rotation (Spin slightly in scatter)
    if (mode !== AppMode.TREE) {
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.005;
    } else {
        // Reset rotation slowly to identity or initial
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, data.rotation[0], 0.05);
    }
    
    if (mode === AppMode.ZOOM && focusedId === data.id) {
       meshRef.current.lookAt(state.camera.position);
    }
  });

  // Photo Component
  if (data.type === 'photo' && data.textureUrl) {
    return (
      <group ref={meshRef}>
        <DreiImage url={data.textureUrl} transparent scale={[1, 1]} />
        {/* Gold Frame */}
        <Box args={[1.1, 1.1, 0.05]} position={[0,0,-0.03]}>
           <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={1} />
        </Box>
      </group>
    );
  }

  return (
    <group ref={meshRef}>
      {data.type === 'sphere' && (
        <Sphere args={[1, 32, 32]}>
          <meshStandardMaterial {...materialParams} />
        </Sphere>
      )}
      {data.type === 'cube' && (
        <Box args={[1.5, 1.5, 1.5]}>
          <meshStandardMaterial {...materialParams} />
        </Box>
      )}
      {data.type === 'cane' && (
        <group>
             {/* Simple Cane representation: Red Cylinder */}
            <Cylinder args={[0.3, 0.3, 3, 16]}>
                 <meshStandardMaterial color="#8a0303" roughness={0.3} metalness={0.2} />
            </Cylinder>
            <Box args={[0.4, 3.1, 0.1]} rotation={[0, Math.PI/4, 0]}>
                 <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} />
            </Box>
        </group>
      )}
    </group>
  );
};

const TreeParticles: React.FC = () => {
  const { particles, mode, focusedPhotoId, setParticles, photos } = useStore();
  const initialized = useRef(false);

  // Initialize particles when photos change or on mount
  useEffect(() => {
    // Dynamically import geometry generator to avoid circular deps if any
    import('../utils/geometry').then(({ generateParticles }) => {
        const newParticles = generateParticles(150, photos);
        setParticles(newParticles);
    });
  }, [photos, setParticles]);

  return (
    <group>
      {particles.map((p) => (
        <ParticleMesh key={p.id} data={p} mode={mode} focusedId={focusedPhotoId} />
      ))}
    </group>
  );
};

export default TreeParticles;