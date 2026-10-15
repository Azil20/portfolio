import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

// 1. Vector 2D Shapes for A, Z, I, L matching the 3D model geometry
function createAShape() {
  const shape = new THREE.Shape();
  const w = 0.98;
  const legW = 0.22;
  const topCut = 0.415;
  const h = 1.0;
  const crossBottomY = 0.34;
  const crossTopY = 0.50;

  // Outer boundary (Counter-Clockwise)
  shape.moveTo(0, 0);
  shape.lineTo(legW, 0);
  shape.lineTo(topCut * crossBottomY + legW, crossBottomY);
  shape.lineTo(w - legW - topCut * crossBottomY, crossBottomY);
  shape.lineTo(w - legW, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w - topCut, h);
  shape.lineTo(topCut, h);
  shape.closePath();

  // Triangular counter hole above crossbar (Clockwise)
  const hole = new THREE.Path();
  const holeApexY = (w / 2 - legW) / topCut;
  const holeLeftX = topCut * crossTopY + legW;
  const holeRightX = w - legW - topCut * crossTopY;

  hole.moveTo(w / 2, holeApexY);
  hole.lineTo(holeRightX, crossTopY);
  hole.lineTo(holeLeftX, crossTopY);
  hole.closePath();

  shape.holes.push(hole);
  return { shape, width: w };
}

function createZShape() {
  const shape = new THREE.Shape();
  const w = 0.88;
  const barH = 0.22;
  const diagW = 0.23;

  shape.moveTo(0, 1);
  shape.lineTo(w, 1);
  shape.lineTo(w, 1 - barH);
  shape.lineTo(diagW + 0.05, barH);
  shape.lineTo(w, barH);
  shape.lineTo(w, 0);
  shape.lineTo(0, 0);
  shape.lineTo(0, barH);
  shape.lineTo(w - diagW - 0.05, 1 - barH);
  shape.lineTo(0, 1 - barH);
  shape.closePath();
  return { shape, width: w };
}

function createIShape() {
  const shape = new THREE.Shape();
  const w = 0.24;
  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, 1);
  shape.lineTo(0, 1);
  shape.closePath();
  return { shape, width: w };
}

function createLShape() {
  const shape = new THREE.Shape();
  const w = 0.74;
  const stemW = 0.24;
  const barH = 0.22;

  shape.moveTo(0, 0);
  shape.lineTo(w, 0);
  shape.lineTo(w, barH);
  shape.lineTo(stemW, barH);
  shape.lineTo(stemW, 1);
  shape.lineTo(0, 1);
  shape.closePath();
  return { shape, width: w };
}

// 3D Scene containing the extruded chrome letters and dynamic reflection lights
function TitleScene({
  containerRef,
  mousePosRef,
  isHovered
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
  isHovered: boolean;
}) {
  const titleGroupRef = useRef<THREE.Group>(null);
  const cursorLightRef = useRef<THREE.PointLight>(null);
  const fireflyLight1Ref = useRef<THREE.PointLight>(null);
  const fireflyLight2Ref = useRef<THREE.PointLight>(null);
  const fireflyWashRef = useRef<THREE.PointLight>(null);

  // Exact 3D Physical Matte Chrome Material matching the 3D Robot Head
  const chromeMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#0a0808',
    metalness: 0.989,
    roughness: 0.09,
    envMapIntensity: 2.25,
    clearcoat: 1,
    clearcoatRoughness: 0.5
  }), []);

  // Geometry extrusion settings with rounded bevels for chrome specular curvature
  const extrudeSettings: THREE.ExtrudeGeometryOptions = useMemo(() => ({
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.025,
    bevelOffset: 0,
    bevelSegments: 4
  }), []);

  // Create and center geometries
  const geometries = useMemo(() => {
    const aGeom = new THREE.ExtrudeGeometry(createAShape().shape, extrudeSettings);
    const zGeom = new THREE.ExtrudeGeometry(createZShape().shape, extrudeSettings);
    const iGeom = new THREE.ExtrudeGeometry(createIShape().shape, extrudeSettings);
    const lGeom = new THREE.ExtrudeGeometry(createLShape().shape, extrudeSettings);

    aGeom.computeVertexNormals();
    zGeom.computeVertexNormals();
    iGeom.computeVertexNormals();
    lGeom.computeVertexNormals();

    return { aGeom, zGeom, iGeom, lGeom };
  }, [extrudeSettings]);

  // Firefly swarm real-time tracking
  const firefliesActiveRef = useRef(false);
  const firefliesCoordsRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const handleFlight = (e: CustomEvent<{ active: boolean; p: number; fireflies: { x: number; y: number }[] }>) => {
      firefliesActiveRef.current = e.detail?.active ?? false;
      firefliesCoordsRef.current = e.detail?.fireflies ?? [];
    };

    window.addEventListener('firefly-swarm-flight' as any, handleFlight);
    return () => {
      window.removeEventListener('firefly-swarm-flight' as any, handleFlight);
    };
  }, []);

  // Dynamic animation and real-time reflection loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Interactive 3D tilt & gentle idle breathing
    if (titleGroupRef.current) {
      const targetRotY = mousePosRef.current.x * 0.18;
      const targetRotX = -mousePosRef.current.y * 0.12;
      const breathingY = Math.sin(t * 1.3) * 0.03;
      const breathingTilt = Math.sin(t * 0.8) * 0.008;

      titleGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        titleGroupRef.current.rotation.y,
        targetRotY,
        Math.min(delta * 8, 1)
      );
      titleGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        titleGroupRef.current.rotation.x,
        targetRotX,
        Math.min(delta * 8, 1)
      );
      titleGroupRef.current.rotation.z = breathingTilt;
      titleGroupRef.current.position.y = breathingY;
    }

    // 2. Cursor specular point light tracking
    if (cursorLightRef.current) {
      const targetIntensity = isHovered ? 5.0 : 0.8;
      cursorLightRef.current.intensity = THREE.MathUtils.lerp(
        cursorLightRef.current.intensity,
        targetIntensity,
        Math.min(delta * 10, 1)
      );

      const targetLightX = mousePosRef.current.x * 2.2;
      const targetLightY = mousePosRef.current.y * 1.0;
      cursorLightRef.current.position.x = THREE.MathUtils.lerp(
        cursorLightRef.current.position.x,
        targetLightX,
        Math.min(delta * 14, 1)
      );
      cursorLightRef.current.position.y = THREE.MathUtils.lerp(
        cursorLightRef.current.position.y,
        targetLightY,
        Math.min(delta * 14, 1)
      );
    }

    // 3. Real-time Firefly Reflection System
    // Compute proximity of screen fireflies to the 3D AZIL title bounding box
    let targetIntensity1 = 0;
    let targetIntensity2 = 0;
    let targetWash = 0;

    if (firefliesActiveRef.current && containerRef.current && firefliesCoordsRef.current.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      const titleCenterX = rect.left + rect.width / 2;
      const titleCenterY = rect.top + rect.height / 2;

      // Find closest fireflies to the title
      const coordsWithDist = firefliesCoordsRef.current.map((c) => {
        const dx = c.x - titleCenterX;
        const dy = c.y - titleCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Normalized 3D position (-2.0 on left, +2.0 on right)
        const norm3DX = (dx / (rect.width * 0.5)) * 1.65;
        const norm3DY = -(dy / (rect.height * 0.5)) * 0.65;
        return { ...c, dist, norm3DX, norm3DY, dx, dy };
      });

      coordsWithDist.sort((a, b) => a.dist - b.dist);
      const f1 = coordsWithDist[0];
      const f2 = coordsWithDist[1];

      const INFLUENCE_RADIUS = Math.max(rect.width * 1.25, 420);

      if (f1 && f1.dist < INFLUENCE_RADIUS) {
        const factor1 = Math.max(0, 1 - f1.dist / INFLUENCE_RADIUS);
        // Primary intense firefly green reflection (#a3e635)
        targetIntensity1 = Math.pow(factor1, 1.2) * (8.5 + Math.sin(t * 18) * 2.5);

        if (fireflyLight1Ref.current) {
          fireflyLight1Ref.current.position.x = THREE.MathUtils.lerp(
            fireflyLight1Ref.current.position.x,
            f1.norm3DX,
            0.25
          );
          fireflyLight1Ref.current.position.y = THREE.MathUtils.lerp(
            fireflyLight1Ref.current.position.y,
            f1.norm3DY,
            0.25
          );
          fireflyLight1Ref.current.position.z = 0.85;
        }

        targetWash = factor1 * 2.5;
      }

      if (f2 && f2.dist < INFLUENCE_RADIUS * 1.1) {
        const factor2 = Math.max(0, 1 - f2.dist / (INFLUENCE_RADIUS * 1.1));
        // Secondary warm gold firefly reflection (#facc15)
        targetIntensity2 = Math.pow(factor2, 1.3) * (5.5 + Math.cos(t * 14) * 1.8);

        if (fireflyLight2Ref.current) {
          fireflyLight2Ref.current.position.x = THREE.MathUtils.lerp(
            fireflyLight2Ref.current.position.x,
            f2.norm3DX,
            0.22
          );
          fireflyLight2Ref.current.position.y = THREE.MathUtils.lerp(
            fireflyLight2Ref.current.position.y,
            f2.norm3DY + 0.15,
            0.22
          );
          fireflyLight2Ref.current.position.z = 0.95;
        }
      }
    }

    if (fireflyLight1Ref.current) {
      fireflyLight1Ref.current.intensity = THREE.MathUtils.lerp(
        fireflyLight1Ref.current.intensity,
        targetIntensity1,
        Math.min(delta * 15, 1)
      );
    }
    if (fireflyLight2Ref.current) {
      fireflyLight2Ref.current.intensity = THREE.MathUtils.lerp(
        fireflyLight2Ref.current.intensity,
        targetIntensity2,
        Math.min(delta * 15, 1)
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

  // Base letter layout centered at (0, 0, 0)
  // X Offsets: A=0, Z=1.02, I=2.07, L=2.48. Total width=3.27, Midpoint=1.635
  const midX = 1.635;
  const midY = 0.5;
  const midZ = 0.08;

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 10, 10]} intensity={2.2} />
      <directionalLight position={[-10, 5, -5]} intensity={0.9} color="#e2e8f0" />

      {/* Dynamic Cursor Light following mouse across the chrome bevels */}
      <pointLight
        ref={cursorLightRef}
        color="#ffffff"
        intensity={0.8}
        distance={4.8}
        decay={1.8}
        position={[0, 0, 1.2]}
      />

      {/* Real-time Firefly Primary Neon Lime-Green Light */}
      <pointLight
        ref={fireflyLight1Ref}
        color="#a3e635"
        intensity={0}
        distance={5.2}
        decay={1.5}
        position={[-2, 0, 0.85]}
      />

      {/* Real-time Firefly Secondary Warm Golden Specular Light */}
      <pointLight
        ref={fireflyLight2Ref}
        color="#facc15"
        intensity={0}
        distance={4.6}
        decay={1.6}
        position={[-1.5, 0.2, 0.95]}
      />

      {/* Soft Green-Gold Wash over the entire title */}
      <pointLight
        ref={fireflyWashRef}
        color="#84cc16"
        intensity={0}
        distance={6.5}
        decay={1.3}
        position={[0, 0, 1.5]}
      />

      <Suspense fallback={null}>
        <Environment preset="studio" />
      </Suspense>

      {/* 3D Extruded and Beveled "AZIL" chrome word */}
      <group ref={titleGroupRef} position={[0, 0, 0]}>
        {/* Letter 'A' */}
        <mesh
          geometry={geometries.aGeom}
          material={chromeMaterial}
          position={[0 - midX, -midY, -midZ]}
        />

        {/* Letter 'Z' */}
        <mesh
          geometry={geometries.zGeom}
          material={chromeMaterial}
          position={[1.02 - midX, -midY, -midZ]}
        />

        {/* Letter 'I' */}
        <mesh
          geometry={geometries.iGeom}
          material={chromeMaterial}
          position={[2.07 - midX, -midY, -midZ]}
        />

        {/* Letter 'L' */}
        <mesh
          geometry={geometries.lGeom}
          material={chromeMaterial}
          position={[2.48 - midX, -midY, -midZ]}
        />
      </group>
    </>
  );
}

export default function ChromeTitle3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

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

  // Clicking on "AZIL" summons the fireflies across the screen!
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('trigger-fireflies'));
  };

  return (
    <div
      ref={containerRef}
      className="chrome-title-3d-wrapper"
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      title="Click to summon fireflies"
      role="presentation"
    >
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
      >
        <TitleScene
          containerRef={containerRef}
          mousePosRef={mousePosRef}
          isHovered={isHovered}
        />
      </Canvas>
    </div>
  );
}
