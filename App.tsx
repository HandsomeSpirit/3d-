import React, { Suspense } from 'react';
import Experience from './components/Experience';
import GestureHandler from './components/GestureHandler';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-[#FFD700] bg-black">
          Loading Magic...
        </div>
      }>
        <GestureHandler />
        <UIOverlay />
        <Experience />
      </Suspense>
    </div>
  );
};

export default App;