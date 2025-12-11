import { create } from 'zustand';
import { AppMode, ParticleData } from './types';
import { Vector3 } from 'three';

interface AppState {
  mode: AppMode;
  particles: ParticleData[];
  photos: string[];
  focusedPhotoId: string | null;
  cameraRotationTarget: number;
  
  // Actions
  setMode: (mode: AppMode) => void;
  addPhoto: (url: string) => void;
  setParticles: (particles: ParticleData[]) => void;
  setFocusedPhotoId: (id: string | null) => void;
  setCameraRotationTarget: (rad: number) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  mode: AppMode.TREE,
  particles: [],
  photos: [],
  focusedPhotoId: null,
  cameraRotationTarget: 0,

  setMode: (mode) => set({ mode }),
  addPhoto: (url) => set((state) => ({ photos: [...state.photos, url] })),
  setParticles: (particles) => set({ particles }),
  setFocusedPhotoId: (id) => set({ focusedPhotoId: id }),
  setCameraRotationTarget: (rad) => set({ cameraRotationTarget: rad }),
  reset: () => set({ mode: AppMode.TREE, focusedPhotoId: null, cameraRotationTarget: 0 }),
}));