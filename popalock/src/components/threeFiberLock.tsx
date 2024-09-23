import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Group, AnimationMixer, LoopOnce } from 'three';
import { OrbitControls, Float } from '@react-three/drei';
import { gsap } from 'gsap';

const LoadLock = forwardRef((props, ref) => {
  const gltf = useLoader(GLTFLoader, '/models/lockAnimated2.glb');
  const group = useRef<Group>(null);
  const mixer = useRef<AnimationMixer | null>(null);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
  });

  const openLock = () => {
    // Trigger the GLTF animation
    if (gltf.animations && gltf.animations.length > 0 && gltf.scene) {
      mixer.current = new AnimationMixer(gltf.scene);
      const action = mixer.current.clipAction(gltf.animations[0]); // Assuming the first animation

      // Set to play the animation once and hold the final frame
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();

      // Adding a 'finished' event to keep the last frame
      mixer.current.addEventListener('finished', () => {
        action.halt(0);
      });
    }
  }

  // A kinda weird hack to close the lock on game over, open to a better solution :)
  const closeLock = () => {
    // Reset animation to original position
    if (gltf.animations && gltf.animations.length > 0 && gltf.scene) {
      mixer.current = new AnimationMixer(gltf.scene);
      const action = mixer.current.clipAction(gltf.animations[0]); // Assuming the first animation
      action.setLoop(LoopOnce, 1);
      action.play();
      action.paused = true;
    }
  }
  // Define the shaking animation
  const shakeLockAnimation = () => {
    const lock = group.current;
    if (!lock) return;

    // Trigger the GSAP rotation (shaking effect)
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
    openLock,
    closeLock,
  }));

  return (
    <group ref={group} onClick={shakeLockAnimation} position={[0, -1.5, 0]}>
      <mesh>
        {gltf.scene && <primitive object={gltf.scene} />}
        <directionalLight color="whitesmoke" position={[0, 0, -5]} intensity={3} />
        <directionalLight color="white" position={[0, 0, 5]} intensity={3} />
      </mesh>
    </group>
  );
});

const ThreeFiberLock = forwardRef((props, ref) => (
  <Canvas style={{ width: '80vw', height: '50vh' }} camera={{ position: [0, -1, 5] }}>
    <OrbitControls maxDistance={10} minDistance={5} maxPolarAngle={2.2} enablePan={false} />
    <Float>
      <LoadLock ref={ref} />
    </Float>
  </Canvas>
));

export default ThreeFiberLock;
