import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Sphere, Box, Torus, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { X } from 'lucide-react';
import PaperPlaneIcon from './PaperPlaneIcon';
import { useTranslation } from 'react-i18next';
import {
  streamAIChat,
  getStoredAIConfig
} from '../services/aiService';
import type {
  AIConfig,
  Message
} from '../services/aiService';

type SleepStage = 'awake' | 'fireflies' | 'sleeping' | 'waking' | 'fetching_book' | 'reading' | 'closing_book' | 'running_back';

// 3D Extruded and Beveled letter "Z" geometry matching the 3D chrome model
function createZGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1);
  shape.lineTo(1, 1);
  shape.lineTo(1, 0.76);
  shape.lineTo(0.34, 0.24);
  shape.lineTo(1, 0.24);
  shape.lineTo(1, 0);
  shape.lineTo(0, 0);
  shape.lineTo(0, 0.24);
  shape.lineTo(0.66, 0.76);
  shape.lineTo(0, 0.76);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 4
  });
  geom.center();
  return geom;
}

// Single floating 3D chrome "Z" mesh
function FloatingChromeZ({
  delay,
  baseScale,
  chromeMaterial
}: {
  delay: number;
  baseScale: number;
  chromeMaterial: THREE.Material;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const zGeom = useMemo(() => createZGeometry(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const cycleDuration = 3.6;
    const rawP = ((t - delay) % cycleDuration + cycleDuration) % cycleDuration;
    const p = rawP / cycleDuration;

    // Rises from the upper-right of the sleeping head into zero gravity
    const startX = 0.35;
    const startY = 0.4;
    const startZ = 0.35;

    const currentX = startX + p * 0.55 + Math.sin(p * Math.PI * 2) * 0.08;
    const currentY = startY + p * 1.55;
    const currentZ = startZ + p * 0.25;

    meshRef.current.position.set(currentX, currentY, currentZ);

    // Dynamic 3D tumbling rotation catching chrome specular highlights!
    meshRef.current.rotation.z = -0.1 + Math.sin(p * Math.PI) * 0.35;
    meshRef.current.rotation.y = Math.sin(p * 2.5) * 0.45;
    meshRef.current.rotation.x = 0.25 + Math.cos(p * 2) * 0.25;

    // Scale lifecycle: emerges, expands, and shrinks gracefully as it rises
    let scaleMult = 1;
    if (p < 0.2) {
      scaleMult = p / 0.2;
    } else if (p > 0.7) {
      scaleMult = (1 - p) / 0.3;
    }

    const s = Math.max(0.001, baseScale * scaleMult);
    meshRef.current.scale.set(s, s, s);
  });

  return <mesh ref={meshRef} geometry={zGeom} material={chromeMaterial} />;
}

// Group of 3 3D chrome "Zzz"
function SleepingZzz3D({
  active,
  chromeMaterial
}: {
  active: boolean;
  chromeMaterial: THREE.Material;
}) {
  if (!active) return null;
  return (
    <group>
      <FloatingChromeZ delay={0} baseScale={0.34} chromeMaterial={chromeMaterial} />
      <FloatingChromeZ delay={1.2} baseScale={0.25} chromeMaterial={chromeMaterial} />
      <FloatingChromeZ delay={2.4} baseScale={0.17} chromeMaterial={chromeMaterial} />
    </group>
  );
}

function Face({
  mousePosRef,
  sleepStage,
  fireflyProgressRef,
  fireflyTrackingRef,
  wakeStartTimeRef,
  isChatOpen,
  isThinking = false,
  isSpeaking = false,
  chromeMaterial,
  isMobile
}: {
  mousePosRef: React.MutableRefObject<{ x: number, y: number }>;
  sleepStage: SleepStage;
  fireflyProgressRef: React.MutableRefObject<number>;
  fireflyTrackingRef: React.MutableRefObject<{ x: number, y: number }>;
  wakeStartTimeRef: React.MutableRefObject<number>;
  isChatOpen: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  chromeMaterial: THREE.Material;
  isMobile: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const bookGroupRef = useRef<THREE.Group>(null);
  const glassesGroupRef = useRef<THREE.Group>(null);
  const leftPageRef = useRef<THREE.Mesh>(null);
  const rightPageRef = useRef<THREE.Mesh>(null);
  const [blink, setBlink] = useState(false);
  const fetchStartTimeRef = useRef(0);
  const closingStartTimeRef = useRef(0);
  const wakeInitialPitchRef = useRef(0.45);
  const wasWakingRef = useRef(false);

  useEffect(() => {
    if (sleepStage === 'fetching_book') {
      fetchStartTimeRef.current = performance.now();
    } else if (sleepStage === 'closing_book') {
      closingStartTimeRef.current = performance.now();
    }
  }, [sleepStage]);

  // Lively blinking when awake
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (sleepStage === 'awake') {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        // On mobile, occasionally trigger an energetic double-blink for extra lifelike personality!
        if (isMobile && Math.random() > 0.45) {
          setTimeout(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 120);
          }, 220);
        }
      }
    }, isMobile ? Math.random() * 2200 + 1400 : Math.random() * 3000 + 2000);
    return () => clearInterval(blinkInterval);
  }, [sleepStage, isMobile]);

  useFrame((state) => {
    const isSleeping = sleepStage === 'sleeping';
    const isFireflies = sleepStage === 'fireflies';
    const isWaking = sleepStage === 'waking';
    const isFetching = sleepStage === 'fetching_book';
    const isReading = sleepStage === 'reading';
    const isClosing = sleepStage === 'closing_book';
    const isRunningBack = sleepStage === 'running_back';
    const p = fireflyProgressRef.current;
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Floating animation
      let floatSpeed = 1.5;
      let floatAmp = 0.12;

      if (isThinking) {
        floatSpeed = 2.0; // focused, thoughtful float
        floatAmp = 0.06;
      } else if (isSpeaking) {
        floatSpeed = 2.2; // animated conversational float
        floatAmp = 0.05;
      } else if (isChatOpen) {
        floatSpeed = 1.3;
        floatAmp = 0.05; // calm and steady while user reads/chats
      } else if (isSleeping) {
        floatSpeed = 0.8;
        floatAmp = 0.05; // deep rhythmic breathing
      } else if (isReading) {
        floatSpeed = 1.0;
        floatAmp = 0.04; // gentle breathing while focused
      } else if (isFetching || isRunningBack) {
        floatSpeed = 4.0;
        floatAmp = 0.08; // jogging bob
      } else if (isFireflies && p >= 0.45 && p <= 0.70) {
        floatSpeed = 2.0;
        floatAmp = 0.04;
      } else if (isWaking) {
        floatSpeed = 3.0;
        floatAmp = 0.03;
      } else if (isMobile) {
        // MOBILE ONLY: Lively, upbeat springy floating rhythm full of energy!
        floatSpeed = 2.3;
        floatAmp = 0.055;
      }

      // Base Y position & headroom:
      // On mobile: baseline is lowered to -0.18 (-0.14 when chat open) so the top hair tufts (reaching +1.67)
      // have generous headroom and are NEVER clipped or hidden by the top edge of the canvas!
      // On PC: maintains original (isChatOpen ? -0.04 : -0.08) position completely untouched.
      // Base Y position & headroom: generous headroom on both laptop and mobile so top hair is never clipped
      const baseY = isChatOpen ? -0.14 : -0.18;

      const bobY = (!isSleeping && !isReading)
        ? Math.sin(t * floatSpeed) * floatAmp + Math.sin(t * (floatSpeed * 2)) * 0.014
        : Math.sin(t * floatSpeed) * floatAmp;

      groupRef.current.position.y = baseY + bobY;
      groupRef.current.position.z = 0;

      // 3D Model Scale: 1.03 for full clarity
      const modelScale = 1.03;
      groupRef.current.scale.set(modelScale, modelScale, modelScale);

      // Position X movement for fetching the book out of screen!
      let targetX = 0;
      if (isFetching) {
        const elapsed = (performance.now() - fetchStartTimeRef.current) / 1000;
        if (elapsed < 0.9) {
          // Dash off screen to the RIGHT!
          targetX = 4.0;
        } else {
          // Returning with the book from the right
          targetX = 0;
        }
      } else if (isRunningBack) {
        // Fast dash back to spot from the right
        targetX = 0;
      }

      const xLerpSpeed = isRunningBack ? 0.25 : (isFetching ? 0.15 : 0.1);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, xLerpSpeed);

      // Head orientation angles:
      // Lively, curious glances, cheerful tilts, and alert nods with seamless mouse responsiveness
      const energyCycle = t * 1.1;
      const energeticYaw = Math.sin(energyCycle * 0.8) * 0.22 + Math.sin(energyCycle * 2.2) * 0.07;
      const energeticPitch = -0.07 + Math.cos(energyCycle * 1.3) * 0.09 + Math.sin(energyCycle * 2.5) * 0.03;
      const energeticRoll = Math.sin(energyCycle * 1.5) * 0.08 + Math.cos(energyCycle * 0.7) * 0.04;

      let targetYaw = isMobile ? energeticYaw : (mousePosRef.current.x !== 0 ? mousePosRef.current.x : energeticYaw * 0.7);
      let targetPitch = isMobile ? energeticPitch : (mousePosRef.current.y !== 0 ? mousePosRef.current.y : energeticPitch * 0.7);
      let targetZ = isMobile ? energeticRoll : (mousePosRef.current.x !== 0 ? Math.sin(t * 1) * 0.04 : energeticRoll);

      if (!isWaking) {
        wasWakingRef.current = false;
      }

      if (isThinking) {
        // Pensive thinking pose: naturally tilted upwards, curious ponderous gaze into thought
        targetYaw = -0.22 + Math.sin(t * 1.4) * 0.08;
        targetPitch = -0.18 + Math.cos(t * 1.6) * 0.04; // natural thoughtful upward ponder
        targetZ = -0.10 + Math.sin(t * 1.2) * 0.03;     // thoughtful side-tilt
      } else if (isSpeaking) {
        // Talking pose: looking warmly towards the chat window with gentle speaking nods
        targetYaw = -0.30 + Math.sin(t * 3.5) * 0.04;
        targetPitch = -0.18 + Math.cos(t * 4.0) * 0.03; // head nods slightly while speaking
        targetZ = Math.sin(t * 2.0) * 0.03;
      } else if (isChatOpen) {
        // Attentive listening pose when on the chat:
        // Turns towards the chat window and looks upwards into the conversation,
        // while tracking user cursor with a smooth, natural blend!
        const chatBaseYaw = -0.28;
        const chatBasePitch = -0.20; // looking UP into the chat window above him
        if (isMobile) {
          // Attentive and enthusiastically listening on mobile
          targetYaw = chatBaseYaw + Math.sin(t * 1.5) * 0.08;
          targetPitch = chatBasePitch + Math.cos(t * 1.8) * 0.06;
          targetZ = Math.sin(t * 1.2) * 0.04;
        } else {
          // Responsive tracking: glances towards cursor with upward bias toward chat
          targetYaw = THREE.MathUtils.clamp(chatBaseYaw + mousePosRef.current.x * 0.35, -0.65, 0.1);
          targetPitch = THREE.MathUtils.clamp(chatBasePitch + mousePosRef.current.y * 0.25, -0.45, 0.05);
          targetZ = (mousePosRef.current.x * 0.05);
        }
      } else if (isFetching) {
        const elapsed = (performance.now() - fetchStartTimeRef.current) / 1000;
        if (elapsed < 0.9) {
          targetYaw = 0.75; // looking forward while sprinting off to the right!
          targetPitch = 0.05;
          targetZ = -0.12;
        } else {
          targetYaw = -0.4; // turning back into frame from the right!
          targetPitch = 0.1;
          targetZ = 0.05;
        }
      } else if (isRunningBack) {
        targetYaw = -0.55; // hurrying back into frame from the right!
        targetPitch = 0;
        targetZ = 0.08;
      } else if (isReading) {
        // Looking down at the book, slight scanning back and forth as if reading lines!
        targetYaw = Math.sin(t * 1.8) * 0.12;
        targetPitch = 0.52; // tilted down towards book
        targetZ = 0;
      } else if (isClosing) {
        // Quickly look up at user as book closes
        targetYaw = mousePosRef.current.x;
        targetPitch = mousePosRef.current.y;
        targetZ = 0;
      } else if (isWaking) {
        if (!wasWakingRef.current) {
          wasWakingRef.current = true;
          wakeInitialPitchRef.current = groupRef.current ? groupRef.current.rotation.x : 0.45;
        }
        const wakeElapsed = Math.min(1, (performance.now() - wakeStartTimeRef.current) / 1150);
        const decay = Math.max(0, 1 - wakeElapsed);
        const headWaveYaw = Math.sin(wakeElapsed * Math.PI * 6.5) * 0.48 * decay;
        const headWavePitch = THREE.MathUtils.lerp(wakeInitialPitchRef.current, mousePosRef.current.y, Math.pow(wakeElapsed, 0.55));
        const headWaveZ = Math.sin(wakeElapsed * Math.PI * 5) * 0.16 * decay;

        targetYaw = headWaveYaw + (1 - decay) * mousePosRef.current.x;
        targetPitch = headWavePitch;
        targetZ = headWaveZ;
      } else if (isFireflies) {
        targetYaw = fireflyTrackingRef.current.x;
        targetPitch = fireflyTrackingRef.current.y;
        if (p >= 0.45 && p < 0.70) {
          targetPitch = -0.22;
          targetZ = Math.sin(t * 3.5) * 0.06;
        } else if (p >= 0.90) {
          targetPitch = THREE.MathUtils.lerp(targetPitch, 0.45, (p - 0.90) / 0.1);
        }
      } else if (isSleeping) {
        targetYaw = 0;
        targetPitch = 0.45;
        targetZ = 0;
      }

      const lerpSpeed = isThinking ? 0.12 : (isWaking ? 0.16 : (isReading ? 0.08 : (isFireflies ? 0.07 : 0.1)));
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetYaw, lerpSpeed);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetPitch, lerpSpeed);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZ, 0.1);
    }

    // Book & Glasses visibility and animation
    if (bookGroupRef.current && glassesGroupRef.current) {
      let targetBookScale = 0;
      let targetGlassesScale = 0;

      if (isReading) {
        targetBookScale = 1;
        targetGlassesScale = 1;
        // Subtle lifelike breathing float while reading
        bookGroupRef.current.position.y = -0.78 + Math.sin(t * 1.6) * 0.012;
        if (leftPageRef.current && rightPageRef.current) {
          leftPageRef.current.rotation.y = -0.32;
          rightPageRef.current.rotation.y = 0.32;
        }
      } else if (isFetching) {
        bookGroupRef.current.position.y = -0.78;
        const elapsed = (performance.now() - fetchStartTimeRef.current) / 1000;
        if (elapsed >= 0.9) {
          // Returning with the book and glasses on!
          targetBookScale = 1;
          targetGlassesScale = 1;
          if (leftPageRef.current && rightPageRef.current) {
            leftPageRef.current.rotation.y = -0.32;
            rightPageRef.current.rotation.y = 0.32;
          }
        }
      } else if (isClosing) {
        bookGroupRef.current.position.y = -0.78;
        // Smoothly hide book & glasses on wake-up
        const closeElapsed = (performance.now() - closingStartTimeRef.current) / 1000;
        targetBookScale = Math.max(0, 1 - closeElapsed * 3);
        targetGlassesScale = Math.max(0, 1 - closeElapsed * 3.5);

        // Flap book closed animation - clapping both covers shut towards -Z
        if (leftPageRef.current && rightPageRef.current) {
          const closeAngle = THREE.MathUtils.lerp(0.32, 1.48, Math.min(1, closeElapsed * 3.5));
          leftPageRef.current.rotation.y = -closeAngle;
          rightPageRef.current.rotation.y = closeAngle;
        }
      } else {
        bookGroupRef.current.position.y = -0.78;
      }

      const scaleLerp = 0.18;
      bookGroupRef.current.scale.lerp(new THREE.Vector3(targetBookScale, targetBookScale, targetBookScale), scaleLerp);
      glassesGroupRef.current.scale.lerp(new THREE.Vector3(targetGlassesScale, targetGlassesScale, targetGlassesScale), scaleLerp);
    }

    // Eyes logic
    let targetEyeScale = 2.5;

    if (isThinking) {
      // Pensive calculating eyes with subtle thoughtful focus
      targetEyeScale = 1.7;
    } else if (isSpeaking) {
      // Engaged, expressive speaking eyes
      targetEyeScale = 2.5;
    } else if (isChatOpen) {
      // Attentive listening eyes
      targetEyeScale = 2.4;
    } else if (isSleeping) {
      targetEyeScale = 0.08;
    } else if (isReading) {
      targetEyeScale = 1.6; // focused reading eyes behind glasses
    } else if (isClosing || isRunningBack) {
      targetEyeScale = 2.8; // surprised / happy wide eyes on return!
    } else if (isWaking) {
      const wakeElapsed = Math.min(1, (performance.now() - wakeStartTimeRef.current) / 1150);
      if (wakeElapsed < 0.22) {
        targetEyeScale = 1.1;
      } else if (wakeElapsed < 0.42) {
        targetEyeScale = 0.08;
      } else if (wakeElapsed < 0.68) {
        targetEyeScale = 1.8;
      } else if (wakeElapsed < 0.84) {
        targetEyeScale = 0.1;
      } else {
        targetEyeScale = 2.5;
      }
    } else if (isFireflies) {
      if (p < 0.22) {
        targetEyeScale = 2.4;
      } else if (p < 0.45) {
        const droop = (p - 0.22) / 0.23;
        const heavyBlink = (p > 0.32 && p < 0.36) ? 0.08 : 1.0;
        targetEyeScale = THREE.MathUtils.lerp(2.4, 0.9, droop) * heavyBlink;
      } else if (p < 0.70) {
        targetEyeScale = 0.05;
      } else if (p < 0.90) {
        targetEyeScale = 0.35;
      } else {
        targetEyeScale = THREE.MathUtils.lerp(0.35, 0.08, (p - 0.90) / 0.1);
      }
    } else if (blink) {
      targetEyeScale = 0.1;
    } else if (isMobile) {
      // Alert, enthusiastic, alive eyes on mobile!
      targetEyeScale = 2.65 + Math.sin(t * 2.2) * 0.14;
    }

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, targetEyeScale, 0.22);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, targetEyeScale, 0.22);

      // When thinking or on chat, eyes gaze attentively towards conversation
      const targetEyePosY = isThinking ? 0.14 : (isChatOpen ? 0.12 : 0.1);
      leftEyeRef.current.position.y = THREE.MathUtils.lerp(leftEyeRef.current.position.y, targetEyePosY, 0.15);
      rightEyeRef.current.position.y = THREE.MathUtils.lerp(rightEyeRef.current.position.y, targetEyePosY, 0.15);
    }

    // Mouth logic: yawning when sleepiness overtakes him / waking stretch
    if (mouthRef.current) {
      let targetMouthY = 0.12;
      let targetMouthX = 0.6;
      let targetMouthZ = 0.2;

      if (isThinking) {
        // Pursed, subtle thinking mouth
        targetMouthY = 0.09;
        targetMouthX = 0.42;
        targetMouthZ = 0.16;
      } else if (isSpeaking) {
        // Naturally animated speech mouth (syllables articulation)
        targetMouthY = 0.14 + Math.abs(Math.sin(t * 11)) * 0.28;
        targetMouthX = 0.58 + Math.sin(t * 8) * 0.08;
        targetMouthZ = 0.22;
      } else if (isChatOpen) {
        // Subtle friendly resting smile while listening
        targetMouthY = 0.13;
        targetMouthX = 0.65;
        targetMouthZ = 0.2;
      } else if (isWaking) {
        const wakeElapsed = Math.min(1, (performance.now() - wakeStartTimeRef.current) / 1150);
        const stretch = Math.sin(wakeElapsed * Math.PI) * 0.45;
        targetMouthY = 0.12 + stretch;
        targetMouthX = 0.6 + stretch * 0.2;
      } else if (isFireflies && p >= 0.45 && p < 0.70) {
        // Big cute sleepy yawn 'O' stretch!
        targetMouthY = 2.2;
        targetMouthX = 1.15;
        targetMouthZ = 0.9;
      } else if (isSleeping) {
        targetMouthY = 0.06;
        targetMouthX = 0.45;
        targetMouthZ = 0.15;
      } else if (isMobile) {
        // Cheerful, energetic pleasant smile on mobile
        targetMouthY = 0.14 + Math.abs(Math.sin(t * 2.8)) * 0.02;
        targetMouthX = 0.68 + Math.sin(t * 1.8) * 0.05;
        targetMouthZ = 0.22;
      }

      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetMouthY, 0.18);
      mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, targetMouthX, 0.18);
      mouthRef.current.scale.z = THREE.MathUtils.lerp(mouthRef.current.scale.z, targetMouthZ, 0.18);
    }
  });

  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.2,
    metalness: 0.8
  }), []);

  return (
    <group ref={groupRef}>
      {/* Head */}
      <Sphere args={[1, 64, 64]} scale={[1, 1.05, 1]} material={chromeMaterial} />

      {/* Hair Top Left */}
      <Sphere args={[0.35, 32, 32]} scale={[1, 1.8, 1]} position={[-0.5, 0.8, 0.4]} rotation={[0.4, -0.2, -0.5]} material={chromeMaterial} />

      {/* Hair Top Middle */}
      <Sphere args={[0.4, 32, 32]} scale={[1, 1.8, 1]} position={[0, 0.95, 0.5]} rotation={[0.5, 0, 0]} material={chromeMaterial} />

      {/* Hair Top Right */}
      <Sphere args={[0.35, 32, 32]} scale={[1, 1.8, 1]} position={[0.5, 0.8, 0.4]} rotation={[0.4, 0.2, 0.5]} material={chromeMaterial} />

      {/* Hair Back Left */}
      <Sphere args={[0.25, 32, 32]} scale={[1, 1.5, 1]} position={[-0.8, 0.3, -0.2]} rotation={[0.2, 0, 0.5]} material={chromeMaterial} />

      {/* Hair Back Right */}
      <Sphere args={[0.25, 32, 32]} scale={[1, 1.5, 1]} position={[0.8, 0.3, -0.2]} rotation={[0.2, 0, -0.5]} material={chromeMaterial} />

      {/* Hair Back Bottom */}
      <Sphere args={[0.2, 32, 32]} scale={[1, 1.2, 1]} position={[-0.5, -0.5, -0.6]} rotation={[0, 0, 0.3]} material={chromeMaterial} />
      <Sphere args={[0.2, 32, 32]} scale={[1, 1.2, 1]} position={[0.5, -0.5, -0.6]} rotation={[0, 0, -0.3]} material={chromeMaterial} />

      {/* Ears */}
      <Sphere args={[0.15, 32, 32]} scale={[1, 1.2, 1]} position={[-1.0, 0, 0.1]} rotation={[0, 0, 0.3]} material={chromeMaterial} />
      <Sphere args={[0.15, 32, 32]} scale={[1, 1.2, 1]} position={[1.0, 0, 0.1]} rotation={[0, 0, -0.3]} material={chromeMaterial} />

      {/* Eyes */}
      <Sphere ref={leftEyeRef} args={[0.08, 32, 32]} scale={[1, 2.5, 1]} position={[-0.35, 0.1, 0.95]} material={eyeMaterial} />
      <Sphere ref={rightEyeRef} args={[0.08, 32, 32]} scale={[1, 2.5, 1]} position={[0.35, 0.1, 0.95]} material={eyeMaterial} />

      {/* Mouth */}
      <Sphere
        ref={mouthRef}
        args={[0.08, 32, 32]}
        scale={[0.6, 0.12, 0.2]}
        position={[0, -0.22, 0.96]}
        material={eyeMaterial}
      />

      {/* Glasses */}
      <group ref={glassesGroupRef} scale={0} position={[0, 0.15, 1.05]}>
        {/* Left lens */}
        <Torus args={[0.22, 0.035, 16, 48]} position={[-0.32, 0, 0]} material={chromeMaterial} />
        {/* Right lens */}
        <Torus args={[0.22, 0.035, 16, 48]} position={[0.32, 0, 0]} material={chromeMaterial} />
        {/* Bridge */}
        <Cylinder args={[0.02, 0.02, 0.2, 8]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={chromeMaterial} />
        {/* Side arms */}
        <Cylinder args={[0.02, 0.02, 0.6, 8]} position={[-0.54, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]} material={chromeMaterial} />
        <Cylinder args={[0.02, 0.02, 0.6, 8]} position={[0.54, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]} material={chromeMaterial} />
      </group>

      {/* Book - Back cover & spine face the user (+Z); inside pages & text face the 3D Model (-Z) */}
      <group ref={bookGroupRef} scale={0} position={[0, -0.78, 1.05]} rotation={[-0.18, 0, 0]}>
        {/* Left half - angles back towards -Z to form open book cradle facing model */}
        <group ref={leftPageRef} position={[-0.015, 0, 0]} rotation={[0, -0.32, 0]}>
          {/* Hardcover Outer Surface - Facing User (+Z) */}
          <Box args={[0.57, 0.77, 0.02]} position={[-0.285, 0, 0.01]}>
            <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.15} />
          </Box>
          {/* Gold Decorative Plate on Cover (Facing User, +Z) */}
          <Box args={[0.34, 0.22, 0.005]} position={[-0.285, 0.08, 0.022]}>
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </Box>
          <Box args={[0.30, 0.18, 0.006]} position={[-0.285, 0.08, 0.023]}>
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </Box>
          <Box args={[0.07, 0.07, 0.007]} position={[-0.285, 0.08, 0.024]} rotation={[0, 0, Math.PI / 4]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </Box>
          {/* Gold Corner Accents (Facing User, +Z) */}
          <Box args={[0.08, 0.08, 0.004]} position={[-0.50, 0.32, 0.021]}>
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </Box>
          <Box args={[0.08, 0.08, 0.004]} position={[-0.50, -0.32, 0.021]}>
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </Box>

          {/* Inner Paper Block - Facing 3D Model (-Z) */}
          <Box args={[0.55, 0.75, 0.035]} position={[-0.275, 0, -0.018]}>
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </Box>
          {/* Printed Text Lines - Facing 3D Model (-Z) for AI reading */}
          <Box args={[0.38, 0.022, 0.005]} position={[-0.275, 0.22, -0.037]}>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </Box>
          <Box args={[0.38, 0.022, 0.005]} position={[-0.275, 0.10, -0.037]}>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </Box>
          <Box args={[0.38, 0.022, 0.005]} position={[-0.275, -0.02, -0.037]}>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </Box>
          <Box args={[0.26, 0.022, 0.005]} position={[-0.335, -0.14, -0.037]}>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </Box>
        </group>

        {/* Right half - angles back towards -Z to form open book cradle facing model */}
        <group ref={rightPageRef} position={[0.015, 0, 0]} rotation={[0, 0.32, 0]}>
          {/* Hardcover Outer Surface - Facing User (+Z) */}
          <Box args={[0.57, 0.77, 0.02]} position={[0.285, 0, 0.01]}>
            <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.15} />
          </Box>
          {/* Gold Decorative Plate on Cover (Facing User, +Z) */}
          <Box args={[0.34, 0.22, 0.005]} position={[0.285, 0.08, 0.022]}>
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </Box>
          <Box args={[0.30, 0.18, 0.006]} position={[0.285, 0.08, 0.023]}>
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </Box>
          <Box args={[0.07, 0.07, 0.007]} position={[0.285, 0.08, 0.024]} rotation={[0, 0, Math.PI / 4]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </Box>
          {/* Gold Corner Accents (Facing User, +Z) */}
          <Box args={[0.08, 0.08, 0.004]} position={[0.50, 0.32, 0.021]}>
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </Box>
          <Box args={[0.08, 0.08, 0.004]} position={[0.50, -0.32, 0.021]}>
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.25} />
          </Box>

          {/* Inner Paper Block - Facing 3D Model (-Z) */}
          <Box args={[0.55, 0.75, 0.035]} position={[0.275, 0, -0.018]}>
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </Box>
          {/* Printed Text Lines - Facing 3D Model (-Z) for AI reading */}
          <Box args={[0.38, 0.022, 0.005]} position={[0.275, 0.22, -0.037]}>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </Box>
          <Box args={[0.38, 0.022, 0.005]} position={[0.275, 0.10, -0.037]}>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </Box>
          <Box args={[0.38, 0.022, 0.005]} position={[0.275, -0.02, -0.037]}>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </Box>
          <Box args={[0.22, 0.022, 0.005]} position={[0.195, -0.14, -0.037]}>
            <meshStandardMaterial color="#64748b" roughness={0.8} />
          </Box>
        </group>

        {/* Spine - Facing User (+Z) */}
        <Cylinder args={[0.038, 0.038, 0.77, 24]} position={[0, 0, 0.012]}>
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
        </Cylinder>
        {/* Spine Ribs / Ridges with Gold Accents */}
        <Cylinder args={[0.041, 0.041, 0.02, 24]} position={[0, 0.26, 0.012]}>
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.041, 0.041, 0.02, 24]} position={[0, 0.09, 0.012]}>
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.041, 0.041, 0.02, 24]} position={[0, -0.09, 0.012]}>
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.041, 0.041, 0.02, 24]} position={[0, -0.26, 0.012]}>
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
        </Cylinder>

        {/* Red Bookmark Ribbon - Facing 3D Model (-Z) between the pages */}
        <Box args={[0.035, 0.45, 0.01]} position={[0.01, -0.25, -0.018]} rotation={[-0.15, 0, 0.05]}>
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </Box>
      </group>
    </group>
  );
}

// 3D Point Light inside Canvas casting real-time green-gold reflections onto the chrome head
function CanvasFireflyReflection({ active, progress }: { active: boolean; progress: number }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    if (!active) {
      lightRef.current.intensity = 0;
      return;
    }
    // Activate reflection light as fireflies reach chatbot (progress 0.65 to 0.98)
    if (progress >= 0.65 && progress <= 0.98) {
      const subP = (progress - 0.65) / 0.33;
      const x = -1.8 + subP * 3.6;
      const y = 0.8 - Math.sin(subP * Math.PI) * 0.9;
      const z = 1.4;
      lightRef.current.position.set(x, y, z);
      lightRef.current.intensity = (4.0 + Math.sin(state.clock.elapsedTime * 15) * 1.5) * Math.sin(subP * Math.PI);
    } else {
      lightRef.current.intensity = 0;
    }
  });

  return <pointLight ref={lightRef} color="#a3e635" intensity={0} distance={4} />;
}

// 3D Point Light casting a dynamic pulsing cyan glow on the chrome head when thinking
function ThinkingLightEffect({ active }: { active: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (!lightRef.current) return;
    const t = state.clock.getElapsedTime();
    let targetIntensity = 0;
    if (active) {
      const pulse = Math.sin(t * 3.5) * 0.5 + 0.5;
      targetIntensity = 0.75 + pulse * 0.45;
      lightRef.current.position.set(0.3, 0.9, 0.9);
    }
    // Smoothly lerp intensity in and out so there's no harsh blinking or popping
    lightRef.current.intensity = THREE.MathUtils.lerp(
      lightRef.current.intensity,
      targetIntensity,
      Math.min(delta * 6, 1)
    );
  });

  return <pointLight ref={lightRef} color="#38bdf8" intensity={0} distance={3.5} />;
}

// Real-time 3D Royal-Blue Point Light that follows the cursor across Med's chrome head
function CursorModelLight({ active }: { active: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const softRef = useRef<THREE.PointLight>(null);
  const targetIntensity = active ? 11.5 : 0;
  const targetSoftIntensity = active ? 4.5 : 0;

  useFrame((state, delta) => {
    if (!lightRef.current) return;

    // Smoothly transition light intensities
    lightRef.current.intensity = THREE.MathUtils.lerp(
      lightRef.current.intensity,
      targetIntensity,
      Math.min(delta * 14, 1)
    );

    if (softRef.current) {
      softRef.current.intensity = THREE.MathUtils.lerp(
        softRef.current.intensity,
        targetSoftIntensity,
        Math.min(delta * 14, 1)
      );
    }

    if (lightRef.current.intensity > 0.05) {
      // Camera fov 45 at distance 3.68 gives exact ray projection scale of 1.52
      const targetX = state.pointer.x * 1.52;
      const targetY = state.pointer.y * 1.52;
      const targetZ = 1.32; // Directly in front of the metallic face surface

      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, Math.min(delta * 22, 1));
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetY, Math.min(delta * 22, 1));
      lightRef.current.position.z = targetZ;

      if (softRef.current) {
        softRef.current.position.x = lightRef.current.position.x;
        softRef.current.position.y = lightRef.current.position.y;
        softRef.current.position.z = 1.58;
      }
    }
  });

  return (
    <group>
      {/* Intense primary specular blue point light */}
      <pointLight
        ref={lightRef}
        color="#0038ff"
        intensity={0}
        distance={4.6}
        decay={1.65}
      />
      {/* Soft radiant ambient blue glow that washes over the cheek and chin contours */}
      <pointLight
        ref={softRef}
        color="#0048ff"
        intensity={0}
        distance={6.5}
        decay={1.35}
      />
    </group>
  );
}

// 5 Fireflies flying from all over the left (Upper Left, Mid Left, Lower Left) across the screen
function ScreenFireflies({
  active,
  scared = false,
  cursorPos,
  onProgress,
  onComplete
}: {
  active: boolean;
  scared?: boolean;
  cursorPos?: { x: number; y: number };
  onProgress: (p: number, screenX: number, screenY: number) => void;
  onComplete: () => void;
}) {
  const [coords, setCoords] = useState<{ x: number; y: number; opacity?: number; scale?: number }[]>([]);
  const reqIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastCoordsRef = useRef<{ x: number; y: number }[]>([]);

  // Flee / Scared state tracking refs
  const scaredRef = useRef(scared);
  const cursorPosRef = useRef(cursorPos);
  const isFleeingRef = useRef(false);
  const fleeStartTimeRef = useRef<number | null>(null);
  const fleeStartCoordsRef = useRef<{ x: number; y: number }[]>([]);
  const fleeVectorsRef = useRef<{ vx: number; vy: number; speed: number }[]>([]);

  useEffect(() => {
    scaredRef.current = scared;
  }, [scared]);

  useEffect(() => {
    cursorPosRef.current = cursorPos;
  }, [cursorPos]);

  // 5 Fireflies emerging from all over the left (upper-left to lower-left) like real fireflies
  const configs = useMemo(() => [
    // 1. Upper-Left firefly (enters high at 14% screen height)
    { id: 1, startX: -90, startYFactor: 0.14, targetYOffset: -25, freq: 2.2, waveAmpX: 18, waveAmpY: 26, scale: 1.25, delay: 0.0, phase: 0.0 },
    // 2. High-Mid-Left firefly (enters at 32% screen height)
    { id: 2, startX: -130, startYFactor: 0.32, targetYOffset: 20, freq: 2.8, waveAmpX: 24, waveAmpY: 34, scale: 0.95, delay: 0.08, phase: 1.5 },
    // 3. Center-Left firefly (enters at 50% screen height)
    { id: 3, startX: -70, startYFactor: 0.50, targetYOffset: -10, freq: 2.0, waveAmpX: 20, waveAmpY: 22, scale: 1.1, delay: 0.03, phase: 3.0 },
    // 4. Lower-Mid-Left firefly (enters at 68% screen height)
    { id: 4, startX: -150, startYFactor: 0.68, targetYOffset: 25, freq: 2.5, waveAmpX: 26, waveAmpY: 28, scale: 0.9, delay: 0.12, phase: 4.2 },
    // 5. Lower-Left firefly (enters low at 86% screen height)
    { id: 5, startX: -100, startYFactor: 0.86, targetYOffset: 5, freq: 1.8, waveAmpX: 16, waveAmpY: 30, scale: 0.85, delay: 0.06, phase: 5.5 }
  ], []);

  useEffect(() => {
    if (!active) {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      setCoords([]);
      startTimeRef.current = null;
      isFleeingRef.current = false;
      fleeStartTimeRef.current = null;
      window.dispatchEvent(new CustomEvent('firefly-swarm-flight', {
        detail: {
          active: false,
          p: 0,
          centroidX: -999,
          centroidY: -999,
          fireflies: []
        }
      }));
      return;
    }

    const DURATION = 7600; // 7.6s natural flight from all over left to right

    const animate = (timestamp: number) => {
      // 1. Scared / Flee Sequence: fireflies scatter frantically away from cursor!
      if (scaredRef.current) {
        if (!isFleeingRef.current) {
          isFleeingRef.current = true;
          fleeStartTimeRef.current = timestamp;
          fleeStartCoordsRef.current = lastCoordsRef.current.length === 5
            ? lastCoordsRef.current.map(c => ({ ...c }))
            : configs.map(c => ({ x: window.innerWidth * 0.35, y: window.innerHeight * c.startYFactor }));

          const mouseX = cursorPosRef.current?.x ?? (window.innerWidth / 2);
          const mouseY = cursorPosRef.current?.y ?? (window.innerHeight / 2);

          fleeVectorsRef.current = configs.map((_c, idx) => {
            const start = fleeStartCoordsRef.current[idx] || { x: 0, y: 0 };
            let dx = start.x - mouseX;
            let dy = start.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let baseAngle: number;
            if (dist < 20) {
              baseAngle = (idx / 5) * Math.PI * 2 - Math.PI / 2;
            } else {
              baseAngle = Math.atan2(dy, dx);
            }

            // Scatter spread angle: fans out the 5 fireflies into a dramatic arc
            const spread = (idx - 2) * 0.38 + Math.sin(idx * 2.3) * 0.16;
            const finalAngle = baseAngle + spread;

            // Startled insect flight: strong upward scare burst into the air
            let vx = Math.cos(finalAngle);
            let vy = Math.sin(finalAngle) - 0.42;
            const len = Math.sqrt(vx * vx + vy * vy);
            vx /= len;
            vy /= len;

            // Dart velocity: 1150 - 1650 px/s
            const speed = 1150 + idx * 140 + ((idx % 2) * 160);
            return { vx, vy, speed };
          });
        }

        const fleeElapsed = timestamp - (fleeStartTimeRef.current ?? timestamp);
        const FLEE_DURATION = 650;
        const fleeP = Math.min(1, fleeElapsed / FLEE_DURATION);

        const travelDistFactor = Math.pow(fleeP, 1.25) * (FLEE_DURATION / 1000);
        const panicDecay = Math.max(0, 1 - fleeP);

        const newCoords = configs.map((c, idx) => {
          const start = fleeStartCoordsRef.current[idx] || { x: 0, y: 0 };
          const vec = fleeVectorsRef.current[idx] || { vx: 0, vy: -1, speed: 1200 };
          const panicJitter = Math.sin(fleeElapsed * 0.08 + idx * 2.8) * 14 * panicDecay;

          return {
            x: start.x + vec.vx * vec.speed * travelDistFactor + panicJitter,
            y: start.y + vec.vy * vec.speed * travelDistFactor + panicJitter,
            opacity: Math.max(0, 1 - Math.pow(fleeP, 1.35)),
            scale: c.scale * (1 + Math.sin(fleeP * Math.PI) * 0.25 - fleeP * 0.3)
          };
        });

        setCoords(newCoords);

        if (fleeP < 1) {
          reqIdRef.current = requestAnimationFrame(animate);
        } else {
          setCoords([]);
          window.dispatchEvent(new CustomEvent('firefly-swarm-flight', {
            detail: {
              active: false,
              p: 1,
              centroidX: -999,
              centroidY: -999,
              fireflies: []
            }
          }));
          onComplete();
        }
        return;
      }

      // 2. Normal peaceful firefly flight
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const p = Math.min(1, elapsed / DURATION);

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Swarm centroid coordinates for 3D model gaze tracking
      const centroidX = -100 + p * (screenW + 200);
      const botY = screenH - 95;
      const centroidY = THREE.MathUtils.lerp(screenH * 0.50, botY, Math.pow(p, 1.3));

      onProgress(p, centroidX, centroidY);

      // Compute each firefly's individual natural flight path
      const newCoords = configs.map((c) => {
        // Individual progress with stagger delay
        const indP = THREE.MathUtils.clamp((p - c.delay) / (1 - c.delay), 0, 1);

        // Individual X path: from startX on left to right of screen
        const curX = c.startX + indP * (screenW + 220 - c.startX);

        // Individual Y path: emerges from its specific left altitude (14%, 32%, 50%, 68%, 86%)
        // and smoothly curves across the screen towards the chatbot area
        const startY = screenH * c.startYFactor;
        const targetY = botY + c.targetYOffset;
        const curveFactor = Math.pow(indP, 1.35);
        const baseY = THREE.MathUtils.lerp(startY, targetY, curveFactor);

        // Natural organic flight flutter
        const timeFactor = (timestamp / 1000) * c.freq + c.phase;
        const waveX = Math.sin(timeFactor * 1.5) * c.waveAmpX;
        const waveY = Math.cos(timeFactor * 2.0) * c.waveAmpY;

        return {
          x: curX + waveX,
          y: baseY + waveY
        };
      });

      lastCoordsRef.current = newCoords.map(c => ({ x: c.x, y: c.y }));
      setCoords(newCoords);

      // Broadcast swarm coordinates to window so 3D chrome sphere reflects fireflies in real-time
      window.dispatchEvent(new CustomEvent('firefly-swarm-flight', {
        detail: {
          active: true,
          p,
          centroidX,
          centroidY,
          fireflies: newCoords
        }
      }));

      if (p < 1) {
        reqIdRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    reqIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.dispatchEvent(new CustomEvent('firefly-swarm-flight', {
        detail: {
          active: false,
          p: 0,
          centroidX: -999,
          centroidY: -999,
          fireflies: []
        }
      }));
    };
  }, [active, configs, onProgress, onComplete]);

  if (!active || coords.length === 0) return null;

  return (
    <div className={`firefly-screen-overlay ${scared ? 'scared' : ''}`} aria-hidden="true">
      {coords.map((pos, idx) => (
        <div
          key={idx}
          className="screen-firefly"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            opacity: pos.opacity !== undefined ? pos.opacity : 1,
            transform: `translate(-50%, -50%) scale(${pos.scale ?? configs[idx].scale})`
          }}
        >
          <div className="firefly-aura" />
          <div className="firefly-core" />
          <div className="firefly-wing wing-left" />
          <div className="firefly-wing wing-right" />
        </div>
      ))}
    </div>
  );
}



export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [sleepStage, setSleepStage] = useState<SleepStage>('awake');
  const [showAgentBubble, setShowAgentBubble] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiConfig] = useState<AIConfig>(getStoredAIConfig);
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

  // Detect mobile / touch devices
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
      isMobileRef.current = mobile;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show the friendly agent bubble briefly when loaded
  useEffect(() => {
    if (!isOpen) {
      setShowAgentBubble(true);
      const timer = setTimeout(() => {
        setShowAgentBubble(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const mousePosRef = useRef({ x: 0, y: 0 });
  const fireflyProgressRef = useRef(0);
  const fireflyTrackingRef = useRef({ x: 0, y: 0 });
  const wakeStartTimeRef = useRef(0);
  const sleepStageRef = useRef<SleepStage>('awake');
  const [fireflyProgress, setFireflyProgress] = useState(0);
  const [isFirefliesScared, setIsFirefliesScared] = useState(false);
  const isFirefliesScaredRef = useRef(false);
  const [scaredCursorPos, setScaredCursorPos] = useState<{ x: number; y: number } | undefined>();
  const cursorScreenPosRef = useRef<{ x: number; y: number }>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });



  const [messages, setMessages] = useState<Message[]>([
    { text: t('chatbot.initialGreeting'), isBot: true }
  ]);

  // Update initial greeting if language changes and no user messages yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].isBot) {
        return [{ text: t('chatbot.initialGreeting'), isBot: true }];
      }
      return prev;
    });
  }, [i18n.language]);
  const [input, setInput] = useState('');
  const [welcomeBubbleText, setWelcomeBubbleText] = useState('');
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bookTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const welcomeBubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  // Keep sleepStageRef synchronized for event listeners
  useEffect(() => {
    sleepStageRef.current = sleepStage;
  }, [sleepStage]);

  // Shared 3D Physical Matte Silver Material ("silver mat")
  const chromeMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#0a0808ff",
    metalness: 0.989,
    roughness: 0.09,
    envMapIntensity: 2.25,
    clearcoat: 1,
    clearcoatRoughness: 0.5
  }), []);

  // Auto-scroll messages as tokens stream in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const wakeUp = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
    if (bookTimeoutRef.current) clearTimeout(bookTimeoutRef.current);
    fireflyProgressRef.current = 0;
    setFireflyProgress(0);
    isFirefliesScaredRef.current = false;
    setIsFirefliesScared(false);
    setSleepStage('awake');
  };

  const triggerWelcomeBack = (msg: string) => {
    setWelcomeBubbleText(msg);
    setShowWelcomeBubble(true);
    if (welcomeBubbleTimeoutRef.current) clearTimeout(welcomeBubbleTimeoutRef.current);
    welcomeBubbleTimeoutRef.current = setTimeout(() => {
      setShowWelcomeBubble(false);
    }, 3500);
  };

  const resetTimeout = (delay = 4000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (bookTimeoutRef.current) clearTimeout(bookTimeoutRef.current);

    if (isOpenRef.current) {
      wakeUp();
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (isOpenRef.current) return;

      const isLightMode = document.documentElement.getAttribute('data-theme') !== 'dark';

      if (isLightMode) {
        // LIGHT MODE: No fireflies! Head goes out of screen to fetch a book, then starts reading
        setSleepStage('fetching_book');
        setShowAgentBubble(false);

        // After fetching (1.8s), starts reading peacefully and waiting for user!
        bookTimeoutRef.current = setTimeout(() => {
          if (sleepStageRef.current === 'fetching_book') {
            setSleepStage('reading');
          }
        }, 1800);
      } else {
        // DARK MODE: 5 Fireflies launch across screen into sleeping mode
        setSleepStage('fireflies');
        setShowAgentBubble(false);
      }
    }, delay);
  };

  // Keep head awake whenever chat is open
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      wakeUp();
      setShowAgentBubble(false);
    } else {
      resetTimeout();
    }
  }, [isOpen]);

  // Close chat on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Listen for dark/light mode toggle
  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (!isOpenRef.current) {
        wakeUp();
        resetTimeout(isDark ? 2000 : 2500);
      }
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Listen for trigger-fireflies event from 3D Chrome Sphere or user interaction
  useEffect(() => {
    const handleTriggerFireflies = () => {
      wakeUp();
      setSleepStage('fireflies');
      setShowAgentBubble(false);
    };

    window.addEventListener('trigger-fireflies', handleTriggerFireflies);
    return () => window.removeEventListener('trigger-fireflies', handleTriggerFireflies);
  }, []);

  // Activity tracking & Lifelike wake-up / welcome back handling (Mobile & Desktop)
  useEffect(() => {
    const handleUserActivity = () => {
      // 1. If user returned while STILL fetching the book (didn't bring book back yet):
      // Runs back immediately to his place and displays "Welcome back!"
      if (sleepStageRef.current === 'fetching_book') {
        if (bookTimeoutRef.current) clearTimeout(bookTimeoutRef.current);
        setSleepStage('running_back');
        setShowAgentBubble(false);
        triggerWelcomeBack(t('chatbot.welcomeBackRunner'));
        if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
        wakeTimeoutRef.current = setTimeout(() => {
          setSleepStage('awake');
        }, 750);
      }
      // 2. If user returned while he brought the book and was reading it:
      // Closes the book, removes glasses, and displays "Welcome back!"
      else if (sleepStageRef.current === 'reading') {
        setSleepStage('closing_book');
        setShowAgentBubble(false);
        triggerWelcomeBack(t('chatbot.welcomeBackReader'));
        if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
        wakeTimeoutRef.current = setTimeout(() => {
          setSleepStage('awake');
        }, 1100);
      }
      // 3. Sleeping mode wake-up in dark mode:
      else if (sleepStageRef.current === 'sleeping') {
        wakeStartTimeRef.current = performance.now();
        setSleepStage('waking');
        setShowAgentBubble(false);
        if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
        wakeTimeoutRef.current = setTimeout(() => {
          setSleepStage('awake');
        }, 1150);
      } else if (sleepStageRef.current === 'fireflies') {
        if (isFirefliesScaredRef.current) return;
        isFirefliesScaredRef.current = true;
        setIsFirefliesScared(true);
        setScaredCursorPos({ ...cursorScreenPosRef.current });

        // Scared fireflies fly away, and 3D model shakes head as he used to do!
        wakeStartTimeRef.current = performance.now();
        setSleepStage('waking');
        setShowAgentBubble(false);
        if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
        wakeTimeoutRef.current = setTimeout(() => {
          setSleepStage('awake');
          isFirefliesScaredRef.current = false;
          setIsFirefliesScared(false);
          resetTimeout();
        }, 1150);
        return;
      } else if (sleepStageRef.current === 'waking') {
        return;
      } else if (sleepStageRef.current === 'awake') {
        wakeUp();
      }

      resetTimeout();
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursorScreenPosRef.current = { x: e.clientX, y: e.clientY };

      // Only track cursor on desktop devices with mouse
      if (!isMobileRef.current) {
        const wrapper = document.querySelector('.chatbot-canvas-wrapper');
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const dx = e.clientX - centerX;
          const dy = centerY - e.clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const CIRCLE_RADIUS = 750;

          if (dist <= CIRCLE_RADIUS) {
            const depth = 350;
            const yaw = Math.atan2(dx, depth);
            const pitch = -Math.atan2(dy, Math.sqrt(dx * dx + depth * depth));

            mousePosRef.current = {
              x: THREE.MathUtils.clamp(yaw, -1.2, 0.8),
              y: THREE.MathUtils.clamp(pitch, -0.85, 0.55)
            };
            setShowAgentBubble(false);
          } else {
            mousePosRef.current = { x: 0, y: 0 };
            if (!isOpenRef.current && sleepStageRef.current === 'awake' && !showWelcomeBubble) {
              setShowAgentBubble(true);
            }
          }
        }
      }

      handleUserActivity();
    };

    const handleTouchActivity = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        cursorScreenPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      handleUserActivity();
    };

    const handleMouseLeave = () => {
      if (isOpenRef.current) {
        wakeUp();
        return;
      }
      mousePosRef.current = { x: 0, y: 0 };
      resetTimeout(3000);
    };

    // Desktop mouse events
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleUserActivity);
    window.addEventListener('blur', handleMouseLeave);
    window.addEventListener('focus', handleUserActivity);

    // Mobile touch & scroll events: Keep the AI model awake as user uses the website on phone!
    window.addEventListener('scroll', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleTouchActivity, { passive: true });
    window.addEventListener('touchmove', handleTouchActivity, { passive: true });

    resetTimeout();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleUserActivity);
      window.removeEventListener('blur', handleMouseLeave);
      window.removeEventListener('focus', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('touchstart', handleTouchActivity);
      window.removeEventListener('touchmove', handleTouchActivity);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
      if (bookTimeoutRef.current) clearTimeout(bookTimeoutRef.current);
      if (welcomeBubbleTimeoutRef.current) clearTimeout(welcomeBubbleTimeoutRef.current);
    };
  }, []);

  // Handle tracking the 5 fireflies as they fly across the screen
  const handleFireflyProgress = (p: number, swarmScreenX: number, swarmScreenY: number) => {
    fireflyProgressRef.current = p;
    setFireflyProgress(p);

    const botCenterX = window.innerWidth - 32 - 75;
    const botCenterY = window.innerHeight - 32 - 75;

    const dx = swarmScreenX - botCenterX;
    const dy = botCenterY - swarmScreenY;

    const depth = 350;
    const yaw = THREE.MathUtils.clamp(Math.atan2(dx, depth), -1.1, 0.55);
    const pitch = THREE.MathUtils.clamp(-Math.atan2(dy, Math.sqrt(dx * dx + depth * depth)), -0.7, 0.45);

    fireflyTrackingRef.current = { x: yaw, y: pitch };
  };

  const handleFireflyComplete = () => {
    if (isFirefliesScaredRef.current) {
      isFirefliesScaredRef.current = false;
      setIsFirefliesScared(false);
      return;
    }
    if (!isOpenRef.current) {
      setSleepStage('sleeping');
    }
  };

  const sendUserText = async (textToSend: string) => {
    if (!textToSend.trim() || isStreaming) return;



    const userText = textToSend.trim();
    setInput('');

    // On mobile, blur active input to gracefully dismiss on-screen keyboard and prevent stuck zoom
    if (isMobile) {
      (document.activeElement as HTMLElement)?.blur();
      window.scrollTo({ top: window.scrollY, behavior: 'instant' });
    }

    const updatedMsgs: Message[] = [
      ...messages,
      { text: userText, isBot: false },
      { text: '', isBot: true }
    ];
    setMessages(updatedMsgs);
    setIsStreaming(true);

    const botMsgIndex = updatedMsgs.length - 1;

    await streamAIChat({
      messages: updatedMsgs.slice(0, -1),
      config: aiConfig,
      onChunk: (accumulated) => {
        setMessages((prev) => {
          const next = [...prev];
          if (next[botMsgIndex]) {
            next[botMsgIndex] = { ...next[botMsgIndex], text: accumulated };
          }
          return next;
        });
      },
      onComplete: () => {
        setIsStreaming(false);
      },
      onError: (errMsg) => {
        setMessages((prev) => {
          const next = [...prev];
          if (next[botMsgIndex]) {
            next[botMsgIndex] = {
              ...next[botMsgIndex],
              text: `⚠️ ${errMsg}\n\nPlease try asking again or reach out to Mohamed directly.`
            };
          }
          return next;
        });
        setIsStreaming(false);
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    await sendUserText(input);
  };

  const isSleeping = sleepStage === 'sleeping';
  const lastBotMsg = messages[messages.length - 1];
  const isBotThinking = isStreaming && (!lastBotMsg || !lastBotMsg.text);
  const isBotSpeaking = isStreaming && Boolean(lastBotMsg && lastBotMsg.text);

  return (
    <>
      {/* Immersive background blur overlay across main window when AI chat is open */}
      <div
        className={`chat-backdrop-blur ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* 5 Fireflies flying from all over the left (upper to lower left) across the screen */}
      <ScreenFireflies
        active={sleepStage === 'fireflies' || isFirefliesScared}
        scared={isFirefliesScared}
        cursorPos={scaredCursorPos}
        onProgress={handleFireflyProgress}
        onComplete={handleFireflyComplete}
      />



      <div className="chatbot-container">
        {/* Chat Window */}
        <div className={`chat-window ${isOpen ? 'open' : ''}`}>
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
              <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>Med</span>
              <span style={{ fontSize: '0.78rem', opacity: 0.75 }}>· AI Assistant</span>
            </div>
            <button type="button" className="chat-close" onClick={() => setIsOpen(false)} title="Close Chat">
              <X size={18} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text ? (
                  <>
                    {msg.text}
                    {isStreaming && i === messages.length - 1 && <span className="typing-cursor"></span>}
                  </>
                ) : (
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                )}
              </div>
            ))}

            {/* Inquiry Topics matching user reference image */}
            {messages.length <= 1 && !isStreaming && (
              <div className="chat-inquiry-section">
                <div className="chat-inquiry-header">
                  <span>INQUIRY TOPICS</span>
                </div>
                <div className="chat-inquiry-grid">
                  <button
                    type="button"
                    className="chat-inquiry-card"
                    onClick={() => sendUserText(i18n.language?.startsWith('fr')
                      ? "Présente-moi Mohamed Azil, son profil, son parcours et ses compétences clés."
                      : "Who is Mohamed? Tell me about his architecture background, Master degree, and key capabilities."
                    )}
                  >
                    <span className="inquiry-card-title">
                      {i18n.language?.startsWith('fr') ? "Qui est Mohamed ?" : "Who is Med?"}
                    </span>
                    <span className="inquiry-card-desc">
                      {i18n.language?.startsWith('fr')
                        ? "Parcours ingénieur, Master IA & Big Data, capacités"
                        : "Architecture, background, and capabilities"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="chat-inquiry-card"
                    onClick={() => sendUserText(i18n.language?.startsWith('fr')
                      ? "Quelle est la stack technique et l'expertise de Mohamed en IA, Machine Learning et Big Data ?"
                      : "What is Mohamed's technical stack in AI, Machine Learning, and Big Data?"
                    )}
                  >
                    <span className="inquiry-card-title">
                      {i18n.language?.startsWith('fr') ? "Stack IA & Machine Learning" : "AI & Machine Learning Stack"}
                    </span>
                    <span className="inquiry-card-desc">
                      {i18n.language?.startsWith('fr')
                        ? "PyTorch, Transformers NLP, Spark, Scikit-Learn"
                        : "PyTorch, Transformers NLP, Spark, and Scikit-Learn"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="chat-inquiry-card"
                    onClick={() => sendUserText(i18n.language?.startsWith('fr')
                      ? "Parle-moi des projets phares de Mohamed, en particulier BMA (NLP & IA Générative) et FraudGuard."
                      : "Tell me about Mohamed's flagship projects, especially BMA (NLP & GenAI) and FraudGuard."
                    )}
                  >
                    <span className="inquiry-card-title">
                      {i18n.language?.startsWith('fr') ? "Projets Phares & NLP" : "Flagship AI Projects"}
                    </span>
                    <span className="inquiry-card-desc">
                      {i18n.language?.startsWith('fr')
                        ? "BMA GenAI Edge+Cloud, DistilBERT, FraudGuard SHAP"
                        : "BMA GenAI Edge+Cloud, DistilBERT, FraudGuard SHAP"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="chat-inquiry-card"
                    onClick={() => sendUserText(i18n.language?.startsWith('fr')
                      ? "Quelles sont les disponibilités de Mohamed pour un stage PFE de fin d'études ou une opportunité d'embauche ?"
                      : "What is Mohamed's availability for a 2025/2026 End-of-Studies PFE internship or engineering role?"
                    )}
                  >
                    <span className="inquiry-card-title">
                      {i18n.language?.startsWith('fr') ? "Disponibilité Stage PFE" : "Internship Availability"}
                    </span>
                    <span className="inquiry-card-desc">
                      {i18n.language?.startsWith('fr')
                        ? "Stage PFE fin d'études 2025/2026 & opportunités ingénieur"
                        : "2025/2026 End-of-Studies PFE and engineering roles"}
                    </span>
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder={isStreaming ? (i18n.language?.startsWith('fr') ? "Med réfléchit..." : "Med is thinking...") : t('chatbot.placeholder')}
              value={input}
              disabled={isStreaming}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              enterKeyHint="send"
            />
            <button type="submit" className="chat-send" disabled={isStreaming || !input.trim()} title="Send message">
              <PaperPlaneIcon size={19} filled={true} />
            </button>
          </form>
        </div>

        {/* Speech / Welcome back bubble on laptop and mobile */}
        {!isOpen && (showWelcomeBubble || showAgentBubble) && (
          <div className="chatbot-welcome-bubble">
            {welcomeBubbleText || t('chatbot.tapToChat', 'Chat with Med')}
          </div>
        )}

        {/* 3D Canvas wrapper */}
        <div
          className={`chatbot-canvas-wrapper ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          onPointerEnter={() => !isMobile && setIsHoveringCanvas(true)}
          onPointerLeave={() => setIsHoveringCanvas(false)}
          onPointerMove={() => !isMobile && !isHoveringCanvas && setIsHoveringCanvas(true)}
          title={isOpen ? "Click to minimize chat" : "Click to chat with Med"}
          style={{ zIndex: 1000 }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 10]} intensity={2} />
            <Suspense fallback={null}>
              <Environment preset="studio" />
            </Suspense>
            <Face
              mousePosRef={mousePosRef}
              sleepStage={sleepStage}
              fireflyProgressRef={fireflyProgressRef}
              fireflyTrackingRef={fireflyTrackingRef}
              wakeStartTimeRef={wakeStartTimeRef}
              isChatOpen={isOpen}
              isThinking={isBotThinking}
              isSpeaking={isBotSpeaking}
              chromeMaterial={chromeMaterial}
              isMobile={isMobile}
            />
            {/* Real-time 3D Royal-Blue Point Light reflecting across chrome head when cursor hovers */}
            <CursorModelLight active={isHoveringCanvas} />
            {/* Real-time green-gold firefly reflection light on chrome head */}
            <CanvasFireflyReflection
              active={sleepStage === 'fireflies' && !isFirefliesScared}
              progress={fireflyProgress}
            />
            {/* Cybernetic neural thinking light effect while AI is processing response */}
            <ThinkingLightEffect active={isBotThinking} />
            {/* 3D Chrome Extruded Zzz meshes using the exact 3D model chromeMaterial */}
            <SleepingZzz3D
              active={isSleeping && !isOpen}
              chromeMaterial={chromeMaterial}
            />
          </Canvas>
        </div>
      </div>
    </>
  );
}
