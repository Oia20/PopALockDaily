import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Group } from 'three';
import { OrbitControls } from '@react-three/drei';
import { Float } from '@react-three/drei';
import { gsap } from 'gsap';

const LoadLock = forwardRef((props, ref) => {
  const gltf = useLoader(GLTFLoader, '/models/lock.glb');
  const group = useRef<Group>(null);

  // Define the shaking animation
  const shakeLockAnimation = () => {
    const lock = group.current;
    if (!lock) return;

    gsap.to(lock.rotation, {
      x: Math.PI / 14,
      duration: 0.15,
      repeat: 5,
      yoyo: true,
      ease: "power1.inOut",
      onComplete: () => {
        gsap.to(lock.rotation, { x: 0, duration: 0.1 });
      },
    });
  };

  // Expose the shakeLockAnimation function to the parent
  useImperativeHandle(ref, () => ({
    shakeLockAnimation,
  }));

  return (
    <group ref={group} onClick={shakeLockAnimation} position={[0, -1.5, 0]}>
      <mesh>
        {gltf.scene && <primitive object={gltf.scene} />}
        <directionalLight color="white" position={[0, 0, -5]} intensity={2} />
        <directionalLight color="white" position={[0, 0, 5]} intensity={2} />
      </mesh>
    </group>
  );
});

const ThreeFiberLock = forwardRef((props, ref) => (
  <Canvas style={{ width: '100%', height: '40vh' }} camera={{ position: [0, -5, 5] }}>
    <OrbitControls />
    <Float>
      <LoadLock ref={ref} />
    </Float>
  </Canvas>
));

export default ThreeFiberLock;