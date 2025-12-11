import { ParticleData } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Colors
const MATTE_GREEN = '#0f3b1e';
const GOLD = '#FFD700';
const RED = '#8a0303';
const WHITE = '#F0F0F0';

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateParticles = (count: number, photos: string[]): ParticleData[] => {
  const particles: ParticleData[] = [];
  const totalParticles = count + photos.length;

  for (let i = 0; i < totalParticles; i++) {
    const isPhoto = i < photos.length;
    
    // Tree Position Calculation (Cone)
    const height = 15;
    const radiusBase = 6;
    
    // Normalized height (0 at bottom, 1 at top)
    const yNorm = Math.random(); 
    // y position (-height/2 to height/2)
    const y = (yNorm * height) - (height / 2);
    
    // Radius at this height (wider at bottom)
    const currentRadius = radiusBase * (1 - yNorm);
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * currentRadius; // Uniform distribution in circle
    
    const x = r * Math.cos(angle);
    const z = r * Math.sin(angle);

    // Tree Position
    const treePos: [number, number, number] = [x, y, z];

    // Scatter Position (Random Sphere/Cube cloud)
    const scatterScale = 25;
    const scatterPos: [number, number, number] = [
      randomRange(-scatterScale, scatterScale),
      randomRange(-scatterScale, scatterScale),
      randomRange(-scatterScale, scatterScale)
    ];

    let type: 'sphere' | 'cube' | 'cane' | 'photo' = 'sphere';
    let color = MATTE_GREEN;
    let scale = randomRange(0.2, 0.5);
    let textureUrl: string | undefined = undefined;

    if (isPhoto) {
      type = 'photo';
      scale = 1.5;
      textureUrl = photos[i];
    } else {
      const rand = Math.random();
      if (rand > 0.9) {
        type = 'cane';
        color = RED;
        scale = randomRange(0.3, 0.6);
      } else if (rand > 0.7) {
        type = 'cube';
        color = GOLD;
        scale = randomRange(0.3, 0.6);
      } else if (rand > 0.6) {
        type = 'sphere';
        color = WHITE; // Ornaments
      }
    }

    particles.push({
      id: uuidv4(),
      type,
      color,
      position: treePos, // Start at tree
      treePosition: treePos,
      scatterPosition: scatterPos,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale,
      textureUrl
    });
  }

  return particles;
};