import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface FireflyCoord {
  x: number;
  y: number;
}

interface SphereSceneProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
  isHovered: boolean;
  isClicked: boolean;
}

function SphereScene({ containerRef, mousePosRef, isHovered, isClicked }: SphereSceneProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const cursorLightRef = useRef<THREE.PointLight>(null);
  const fireflyLight1Ref = useRef<THREE.PointLight>(null);
  const fireflyLight2Ref = useRef<THREE.PointLight>(null);
  const fireflyWashRef = useRef<THREE.PointLight>(null);

  // Exact 3D Physical Matte/Gloss Silver Chrome Material as Chatbot Model
  const chromeMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0a0808ff",
    metalness: 0.989,
    roughness: 0.09,
    envMapIntensity: 2.25,
    clearcoat: 1,
    clearcoatRoughness: 0.5
  }), []);

  // Firefly Swarm Tracker
  const fireflySwarmRef = useRef<{ active: boolean; fireflies: FireflyCoord[] }>({
    active: false,
    fireflies: []
  });

  useEffect(() => {
    const handleFireflyFlight = (e: Event) => {
      const customEvent = e as CustomEvent<{
        active: boolean;
        p: number;
        centroidX: number;
        centroidY: number;
        fireflies: FireflyCoord[];
      }>;
      if (customEvent.detail) {
        fireflySwarmRef.current = {
          active: customEvent.detail.active,
          fireflies: customEvent.detail.fireflies || []
        };
      }
    };

    window.addEventListener('firefly-swarm-flight', handleFireflyFlight);
    return () => window.removeEventListener('firefly-swarm-flight', handleFireflyFlight);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Grounded Static Rotation & Scale (NO zero-gravity floating/bobbing!)
    if (sphereRef.current) {
      // Resting solidly in place at (0, 0, 0)
      sphereRef.current.position.set(0, 0, 0);

      // Subtle interactive rotation tilting toward cursor to catch specular highlights
      const targetRotY = mousePosRef.current.x * 0.45;
      const targetRotX = -mousePosRef.current.y * 0.35;
      sphereRef.current.rotation.y = THREE.MathUtils.lerp(
        sphereRef.current.rotation.y,
        targetRotY,
        Math.min(delta * 8, 1)
      );
      sphereRef.current.rotation.x = THREE.MathUtils.lerp(
        sphereRef.current.rotation.x,
        targetRotX,
        Math.min(delta * 8, 1)
      );

      // Click scale feedback
      const targetScale = isClicked ? 0.92 : (isHovered ? 1.05 : 1.0);
      sphereRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        Math.min(delta * 14, 1)
      );
    }

    // 2. Dynamic Cursor Specular Light
    if (cursorLightRef.current) {
      const targetIntensity = isHovered ? 4.5 : 0.8;
      cursorLightRef.current.intensity = THREE.MathUtils.lerp(
        cursorLightRef.current.intensity,
        targetIntensity,
        Math.min(delta * 10, 1)
      );

      const targetX = mousePosRef.current.x * 1.5;
      const targetY = mousePosRef.current.y * 1.5;
      cursorLightRef.current.position.x = THREE.MathUtils.lerp(
        cursorLightRef.current.position.x,
        targetX,
        Math.min(delta * 12, 1)
      );
      cursorLightRef.current.position.y = THREE.MathUtils.lerp(
        cursorLightRef.current.position.y,
        targetY,
        Math.min(delta * 12, 1)
      );
    }

    // 3. Real-time Screen Firefly Reflection System
    let targetIntensity1 = 0;
    let targetIntensity2 = 0;
    let targetWash = 0;

    const { active, fireflies } = fireflySwarmRef.current;

    if (active && containerRef.current && fireflies.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      const sphereCenterX = rect.left + rect.width / 2;
      const sphereCenterY = rect.top + rect.height / 2;

      // Find fireflies nearest to this sphere
      const firefliesWithDist = fireflies.map((f) => {
        const dx = f.x - sphereCenterX;
        const dy = f.y - sphereCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Normalized 3D position relative to the sphere radius
        const norm3DX = (dx / (rect.width * 0.5)) * 1.45;
        const norm3DY = -(dy / (rect.height * 0.5)) * 1.45;
        return { ...f, dist, norm3DX, norm3DY };
      });

      firefliesWithDist.sort((a, b) => a.dist - b.dist);
      const f1 = firefliesWithDist[0];
      const f2 = firefliesWithDist[1];

      // Proximity influence radius in screen pixels
      const INFLUENCE_RADIUS = Math.max(rect.width * 5.0, 480);

      // Primary Lime-Green Firefly Reflection
      if (f1 && f1.dist < INFLUENCE_RADIUS) {
        const factor1 = Math.max(0, 1 - f1.dist / INFLUENCE_RADIUS);
        // Specular glow with organic pulse
        targetIntensity1 = Math.pow(factor1, 1.15) * (9.0 + Math.sin(t * 18) * 3.0);

        if (fireflyLight1Ref.current) {
          // Clamp light coordinates close to surface
          const clampedX = THREE.MathUtils.clamp(f1.norm3DX, -2.5, 2.5);
          const clampedY = THREE.MathUtils.clamp(f1.norm3DY, -2.5, 2.5);
          fireflyLight1Ref.current.position.x = THREE.MathUtils.lerp(
            fireflyLight1Ref.current.position.x,
            clampedX,
            0.28
          );
          fireflyLight1Ref.current.position.y = THREE.MathUtils.lerp(
            fireflyLight1Ref.current.position.y,
            clampedY,
            0.28
          );
          fireflyLight1Ref.current.position.z = 1.15;
        }

        targetWash = factor1 * 2.8;
      }

      // Secondary Warm Golden Specular Firefly Reflection
      if (f2 && f2.dist < INFLUENCE_RADIUS * 1.1) {
        const factor2 = Math.max(0, 1 - f2.dist / (INFLUENCE_RADIUS * 1.1));
        targetIntensity2 = Math.pow(factor2, 1.25) * (6.0 + Math.cos(t * 15) * 2.0);

        if (fireflyLight2Ref.current) {
          const clampedX2 = THREE.MathUtils.clamp(f2.norm3DX, -2.5, 2.5);
          const clampedY2 = THREE.MathUtils.clamp(f2.norm3DY, -2.5, 2.5);
          fireflyLight2Ref.current.position.x = THREE.MathUtils.lerp(
            fireflyLight2Ref.current.position.x,
            clampedX2,
            0.24
          );
          fireflyLight2Ref.current.position.y = THREE.MathUtils.lerp(
            fireflyLight2Ref.current.position.y,
            clampedY2,
            0.24
          );
          fireflyLight2Ref.current.position.z = 1.25;
        }
      }
    }

    if (fireflyLight1Ref.current) {
      fireflyLight1Ref.current.intensity = THREE.MathUtils.lerp(
        fireflyLight1Ref.current.intensity,
        targetIntensity1,
        Math.min(delta * 14, 1)
      );
    }
    if (fireflyLight2Ref.current) {
      fireflyLight2Ref.current.intensity = THREE.MathUtils.lerp(
        fireflyLight2Ref.current.intensity,
        targetIntensity2,
        Math.min(delta * 14, 1)
      );
    }
    if (fireflyWashRef.current) {
      fireflyWashRef.current.intensity = THREE.MathUtils.lerp(
        fireflyWashRef.current.intensity,
        targetWash,
        Math.min(delta * 12, 1)
      );
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[6, 8, 8]} intensity={2.2} />
      <directionalLight position={[-6, 4, -4]} intensity={0.9} color="#e2e8f0" />

      {/* Dynamic Cursor Light following mouse across the chrome surface */}
      <pointLight
        ref={cursorLightRef}
        color="#ffffff"
        intensity={0.8}
        distance={4.5}
        decay={1.8}
        position={[0, 0, 1.4]}
      />

      {/* Real-time Firefly Primary Neon Lime-Green Specular Light */}
      <pointLight
        ref={fireflyLight1Ref}
        color="#a3e635"
        intensity={0}
        distance={4.8}
        decay={1.6}
        position={[-1.8, 0, 1.15]}
      />

      {/* Real-time Firefly Secondary Warm Gold Specular Light */}
      <pointLight
        ref={fireflyLight2Ref}
        color="#facc15"
        intensity={0}
        distance={4.4}
        decay={1.6}
        position={[-1.2, 0.4, 1.25]}
      />

      {/* Soft Green-Gold Wash over the entire sphere */}
      <pointLight
        ref={fireflyWashRef}
        color="#84cc16"
        intensity={0}
        distance={5.5}
        decay={1.4}
        position={[0, 0, 1.6]}
      />

      <Suspense fallback={null}>
        <Environment preset="studio" />
      </Suspense>

      {/* 3D Chrome Sphere - Resting solidly in place (NO zero gravity floating) */}
      <Sphere
        ref={sphereRef}
        args={[1, 64, 64]}
        material={chromeMaterial}
        position={[0, 0, 0]}
      />
    </>
  );
}

export default function ChromeSphere3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePosRef.current = {
      x: THREE.MathUtils.clamp(x, -1.2, 1.2),
      y: THREE.MathUtils.clamp(y, -1.2, 1.2)
    };
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    mousePosRef.current = { x: 0, y: 0 };
  };

  // Clicking on the 3D chrome sphere summons fireflies across the screen!
  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 220);
    window.dispatchEvent(new CustomEvent('trigger-fireflies'));
  };

  return (
    <div
      ref={containerRef}
      className="hero-chrome-sphere-container"
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      title="Click to summon fireflies"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.1], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
      >
        <SphereScene
          containerRef={containerRef}
          mousePosRef={mousePosRef}
          isHovered={isHovered}
          isClicked={isClicked}
        />
      </Canvas>
    </div>
  );
}
