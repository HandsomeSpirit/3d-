import React from 'react';
import { useStore } from '../store';
import { AppMode } from '../types';

const UIOverlay: React.FC = () => {
  const { mode, addPhoto, photos } = useStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      addPhoto(url);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 font-sans text-white">
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-4xl font-light tracking-widest text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            NOËL LUMIÈRE
          </h1>
          <p className="text-sm text-green-200 opacity-80 mt-1 uppercase tracking-wider">
            Gesture Interactive Tree
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <label className="cursor-pointer bg-gradient-to-r from-[#8a0303] to-[#5c0202] text-[#FFD700] border border-[#FFD700] px-4 py-2 rounded-full uppercase text-xs tracking-widest hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all">
                Add Memory
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="text-xs text-gray-400">{photos.length} Memories loaded</span>
        </div>
      </header>

      {/* Mode Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center opacity-30 pointer-events-none">
        <h2 className="text-6xl font-bold tracking-[1rem] text-white blur-sm">{mode}</h2>
      </div>

      {/* Footer / Instructions */}
      <footer className="flex justify-center gap-8 text-sm tracking-wide text-gray-300">
        <InstructionItem 
            active={mode === AppMode.TREE} 
            icon="✊" 
            label="FIST" 
            desc="Close Tree" 
        />
        <InstructionItem 
            active={mode === AppMode.SCATTER} 
            icon="🖐" 
            label="OPEN" 
            desc="Scatter" 
        />
        <InstructionItem 
            active={mode === AppMode.SCATTER} 
            icon="👋" 
            label="MOVE" 
            desc="Rotate View" 
        />
        <InstructionItem 
            active={mode === AppMode.ZOOM} 
            icon="🤏" 
            label="PINCH" 
            desc="Grab Memory" 
        />
      </footer>
    </div>
  );
};

const InstructionItem = ({ icon, label, desc, active }: { icon: string, label: string, desc: string, active: boolean }) => (
  <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${active ? 'opacity-100 text-[#FFD700] scale-110' : 'opacity-40 grayscale'}`}>
    <div className="text-2xl mb-1 drop-shadow-lg">{icon}</div>
    <div className="font-bold border-b border-transparent">{label}</div>
    <div className="text-xs opacity-70">{desc}</div>
  </div>
);

export default UIOverlay;