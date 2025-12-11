import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Hands, Results } from '@mediapipe/hands';
import { useStore } from '../store';
import { AppMode } from '../types';

const GestureHandler: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setMode, setCameraRotationTarget, mode, photos, setFocusedPhotoId, particles } = useStore();
  const [cameraPermission, setCameraPermission] = useState(false);
  const lastGestureTime = useRef<number>(0);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start()
      .then(() => setCameraPermission(true))
      .catch((err) => console.error("Camera error:", err));

    return () => {
      // Cleanup if needed, though camera.stop() isn't always reliable in React strict mode immediately
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResults = (results: Results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

    const landmarks = results.multiHandLandmarks[0];
    
    // 1. Detect Fingers Open
    const fingers = countFingers(landmarks);
    
    // 2. Detect Pinch (Thumb tip to Index tip)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const isPinching = distance < 0.05;

    // 3. Detect Hand Position (Centroid)
    const wrist = landmarks[0];
    // Map x from [0, 1] to [-1, 1] (inverted because webcam is mirrored usually, but let's assume standard)
    // 0 is left, 1 is right.
    const handX = (wrist.x - 0.5) * 2; 

    // Logic for State Transitions with Debounce
    const now = Date.now();
    if (now - lastGestureTime.current > 500) { // 500ms debounce for mode switching
      
      if (fingers <= 1 && !isPinching) {
        // FIST -> Tree
        if (mode !== AppMode.TREE) {
           setMode(AppMode.TREE);
           setFocusedPhotoId(null);
           lastGestureTime.current = now;
        }
      } else if (fingers >= 4) {
        // OPEN HAND -> Scatter
        if (mode !== AppMode.SCATTER) {
          setMode(AppMode.SCATTER);
          setFocusedPhotoId(null);
          lastGestureTime.current = now;
        }
      } else if (isPinching && mode === AppMode.SCATTER) {
        // GRAB -> Zoom (Pick random photo if none selected)
        if (photos.length > 0) {
            setMode(AppMode.ZOOM);
            // In a real app we would raycast to find the closest photo. 
            // Here we pick a random one for effect.
            const randomPhoto = particles.find(p => p.type === 'photo');
            if (randomPhoto) {
               setFocusedPhotoId(randomPhoto.id);
            }
            lastGestureTime.current = now;
        }
      }
    }

    // Continuous updates (Rotation)
    if (mode === AppMode.SCATTER) {
      // Map hand X movement to camera rotation
      // -1 (left) to 1 (right) -> -PI to PI
      setCameraRotationTarget(handX * 2); 
    }
  };

  const countFingers = (landmarks: any[]) => {
    let count = 0;
    // Thumb (x comparison depends on hand, simplified here assuming right hand or just checking relative extension)
    // Using y for other fingers
    if (landmarks[4].y < landmarks[3].y) count++; // Rough thumb check
    if (landmarks[8].y < landmarks[6].y) count++; // Index
    if (landmarks[12].y < landmarks[10].y) count++; // Middle
    if (landmarks[16].y < landmarks[14].y) count++; // Ring
    if (landmarks[20].y < landmarks[18].y) count++; // Pinky
    return count;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 opacity-0 pointer-events-none">
      <video ref={videoRef} className="w-32 h-24" playsInline muted />
    </div>
  );
};

export default GestureHandler;