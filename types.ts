export enum AppMode {
  TREE = 'TREE',
  SCATTER = 'SCATTER',
  ZOOM = 'ZOOM'
}

export type ParticleType = 'sphere' | 'cube' | 'cane' | 'photo';

export interface ParticleData {
  id: string;
  type: ParticleType;
  color: string;
  position: [number, number, number]; // Current target
  treePosition: [number, number, number];
  scatterPosition: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  textureUrl?: string;
}

export interface GestureState {
  isFist: boolean;
  isOpenPalm: boolean;
  isPinching: boolean;
  handPosition: { x: number; y: number };
}