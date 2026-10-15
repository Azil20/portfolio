import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import './AdvancedCursor.css';

export interface AdvancedCursorProps {
  className?: string;
  zIndex?: number;
}

type CursorMode = 'default' | 'magnetic' | 'explore' | 'text' | 'drag' | 'hidden';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const INTERACTIVE_TARGETS = [
  'a',
  'button',
  '.btn',
  '.clickable',
  '.theme-toggle',
  '.lang-pill-btn',
  '.timeline-tab-btn',
  '.faq-question-btn',
  '.chat-send',
  '.chat-close',
  '.chat-header-btn',
  '.contact-action-btn',
  '.contact-cv-badge-btn',
  '.chat-inquiry-card',
  '.chat-starter-chip',
  '.form-fallback-mailto-btn',
  '.mobile-nav-toggle'
];

export function AdvancedCursor({ className = '', zIndex = 99999 }: AdvancedCursorProps) {
  const [isTouch, setIsTouch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>('dark');
  const [badgeText, setBadgeText] = useState('EXPLORE ↗');
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Track Theme Changes (Dark / Light)
  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setActiveTheme(theme);
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Theme-adaptive Palette
  const colors = useMemo(() => {
    const isDark = activeTheme === 'dark';
    return {
      dot: isDark ? '#38bdf8' : '#2563eb',
      dotCenter: '#ffffff',
      ringBorder: isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(37, 99, 235, 0.45)',
      ringBg: isDark ? 'rgba(56, 189, 248, 0.06)' : 'rgba(37, 99, 235, 0.05)',
      hoverBorder: isDark ? 'rgba(56, 189, 248, 0.75)' : 'rgba(37, 99, 235, 0.7)',
      hoverBg: isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(37, 99, 235, 0.1)',
      badgeBg: isDark ? 'rgba(11, 15, 23, 0.88)' : 'rgba(255, 255, 255, 0.92)',
      badgeBorder: isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(37, 99, 235, 0.35)',
      badgeText: isDark ? '#ffffff' : '#0f172a',
      ripple: isDark ? 'rgba(56, 189, 248, 0.5)' : 'rgba(37, 99, 235, 0.4)'
    };
  }, [activeTheme]);

  // Motion Values for Precision Dot (immediate, zero lag)
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  // Motion Values for Follower (spring-damped)
  const targetFollowerX = useMotionValue(-100);
  const targetFollowerY = useMotionValue(-100);
  const targetFollowerW = useMotionValue(36);
  const targetFollowerH = useMotionValue(36);
  const targetFollowerR = useMotionValue(18);

  // Velocity stretch & orientation
  const targetScaleX = useMotionValue(1);
  const targetScaleY = useMotionValue(1);
  const targetRotation = useMotionValue(0);

  // Physics Springs for buttery organic motion
  const followerX = useSpring(targetFollowerX, { stiffness: 450, damping: 30 });
  const followerY = useSpring(targetFollowerY, { stiffness: 450, damping: 30 });
  const followerW = useSpring(targetFollowerW, { stiffness: 400, damping: 30 });
  const followerH = useSpring(targetFollowerH, { stiffness: 400, damping: 30 });
  const followerR = useSpring(targetFollowerR, { stiffness: 400, damping: 30 });
  const scaleXSpring = useSpring(targetScaleX, { stiffness: 350, damping: 25 });
  const scaleYSpring = useSpring(targetScaleY, { stiffness: 350, damping: 25 });
  const rotationSpring = useSpring(targetRotation, { stiffness: 350, damping: 25 });

  // Velocity tracking refs
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(performance.now());
  const velocityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect Touch / Mobile Devices
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(hover: none)').matches;
      setIsTouch(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Remove native system cursor on desktop when active
  useEffect(() => {
    if (!isTouch) {
      document.body.classList.add('has-advanced-cursor');
      document.documentElement.classList.add('has-advanced-cursor');
      return () => {
        document.body.classList.remove('has-advanced-cursor');
        document.documentElement.classList.remove('has-advanced-cursor');
      };
    } else {
      document.body.classList.remove('has-advanced-cursor');
      document.documentElement.classList.remove('has-advanced-cursor');
    }
  }, [isTouch]);

  // Mouse Move & Context Detection Handler
  useEffect(() => {
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // 1. Immediately position the precision dot with 0 latency
      dotX.set(clientX - 4);
      dotY.set(clientY - 4);

      if (!isVisible) setIsVisible(true);

      // 2. Velocity calculation for organic stretch
      const now = performance.now();
      const dt = Math.max((now - lastTimeRef.current) / 1000, 0.008);
      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dist / dt; // pixels per second

      lastPosRef.current = { x: clientX, y: clientY };
      lastTimeRef.current = now;

      // Dynamic stretch along trajectory
      if (dist > 2 && cursorMode === 'default') {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const stretchX = Math.min(1 + speed / 3200, 1.32);
        const stretchY = Math.max(1 - speed / 6400, 0.78);

        targetScaleX.set(stretchX);
        targetScaleY.set(stretchY);
        targetRotation.set(angle);

        if (velocityTimeoutRef.current) clearTimeout(velocityTimeoutRef.current);
        velocityTimeoutRef.current = setTimeout(() => {
          targetScaleX.set(1);
          targetScaleY.set(1);
        }, 110);
      }

      // 3. Inspect target element under cursor
      const targetElement = document.elementFromPoint(clientX, clientY);

      // Priority A: Over 3D Model Canvas -> Dissolve completely so chrome lighting shines!
      const isModel = Boolean(targetElement?.closest('.chatbot-canvas-wrapper'));
      if (isModel) {
        setCursorMode('hidden');
        targetFollowerX.set(clientX);
        targetFollowerY.set(clientY);
        targetFollowerW.set(20);
        targetFollowerH.set(20);
        targetFollowerR.set(10);
        targetScaleX.set(1);
        targetScaleY.set(1);
        return;
      }

      // Priority B: Over Project Showcase / Architecture -> Explore Badge mode!
      const projectCard = targetElement?.closest('.project-card');
      const archItem = targetElement?.closest('.arch-pillar-card, .arch-pipeline-step');
      if (projectCard || archItem) {
        setCursorMode('explore');
        setBadgeText(projectCard ? 'VIEW ↗' : 'EXPAND ↗');
        const badgeSize = 64;
        targetFollowerX.set(clientX - badgeSize / 2);
        targetFollowerY.set(clientY - badgeSize / 2);
        targetFollowerW.set(badgeSize);
        targetFollowerH.set(badgeSize);
        targetFollowerR.set(badgeSize / 2);
        targetScaleX.set(1);
        targetScaleY.set(1);
        targetRotation.set(0);
        return;
      }

      // Priority C: Over Draggable Option Wheel -> Drag mode!
      const isWheel = Boolean(targetElement?.closest('.option-wheel'));
      if (isWheel) {
        setCursorMode('drag');
        const wheelSize = 48;
        targetFollowerX.set(clientX - wheelSize / 2);
        targetFollowerY.set(clientY - wheelSize / 2);
        targetFollowerW.set(wheelSize);
        targetFollowerH.set(wheelSize);
        targetFollowerR.set(wheelSize / 2);
        targetScaleX.set(1);
        targetScaleY.set(1);
        targetRotation.set(0);
        return;
      }

      // Priority D: Over Text Input / Textarea -> I-Beam mode!
      const isInput = Boolean(targetElement?.closest('input, textarea, .chat-input, [contenteditable="true"]'));
      if (isInput) {
        setCursorMode('text');
        targetFollowerX.set(clientX - 2);
        targetFollowerY.set(clientY - 12);
        targetFollowerW.set(4);
        targetFollowerH.set(24);
        targetFollowerR.set(2);
        targetScaleX.set(1);
        targetScaleY.set(1);
        targetRotation.set(0);
        return;
      }

      // Priority E: Over Interactive Buttons / Links -> Magnetic Snap & Morph!
      let matchedInteractive: HTMLElement | null = null;
      for (const sel of INTERACTIVE_TARGETS) {
        const el = targetElement?.closest(sel) as HTMLElement | null;
        if (el) {
          matchedInteractive = el;
          break;
        }
      }

      if (matchedInteractive) {
        setCursorMode('magnetic');
        const rect = matchedInteractive.getBoundingClientRect();
        const computed = window.getComputedStyle(matchedInteractive);
        const computedRadius = parseFloat(computed.borderRadius) || 12;

        const isCompact = rect.width <= 260 && rect.height <= 72;

        if (isCompact) {
          // Magnetic Snap wrapping element
          const padding = 6;
          const targetW = rect.width + padding * 2;
          const targetH = rect.height + padding * 2;
          const targetX = rect.left - padding;
          const targetY = rect.top - padding;

          targetFollowerX.set(targetX);
          targetFollowerY.set(targetY);
          targetFollowerW.set(targetW);
          targetFollowerH.set(targetH);
          targetFollowerR.set(computedRadius + padding);
        } else {
          // Gentle expansion around cursor
          const size = 50;
          targetFollowerX.set(clientX - size / 2);
          targetFollowerY.set(clientY - size / 2);
          targetFollowerW.set(size);
          targetFollowerH.set(size);
          targetFollowerR.set(size / 2);
        }

        targetScaleX.set(1);
        targetScaleY.set(1);
        targetRotation.set(0);
        return;
      }

      // Priority F: Default Free Float
      setCursorMode('default');
      const defaultSize = 36;
      targetFollowerX.set(clientX - defaultSize / 2);
      targetFollowerY.set(clientY - defaultSize / 2);
      targetFollowerW.set(defaultSize);
      targetFollowerH.set(defaultSize);
      targetFollowerR.set(defaultSize / 2);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      // Generate micro shockwave ripple
      const newRipple: Ripple = {
        id: performance.now(),
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev.slice(-3), newRipple]);
    };

    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (velocityTimeoutRef.current) clearTimeout(velocityTimeoutRef.current);
    };
  }, [
    isTouch,
    isVisible,
    cursorMode,
    dotX,
    dotY,
    targetFollowerX,
    targetFollowerY,
    targetFollowerW,
    targetFollowerH,
    targetFollowerR,
    targetScaleX,
    targetScaleY,
    targetRotation
  ]);

  const removeRipple = useCallback((id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  if (isTouch) {
    return null;
  }

  const isHidden = cursorMode === 'hidden' || !isVisible;

  return (
    <div className={`advanced-cursor-container ${className}`} style={{ zIndex }} aria-hidden="true">
      {/* 1. Precision Core Dot (Zero-lag immediate feedback) */}
      <motion.div
        className="advanced-cursor-dot"
        style={{
          x: dotX,
          y: dotY,
          width: 8,
          height: 8,
          backgroundColor: colors.dot,
          opacity: isHidden ? 0 : (cursorMode === 'explore' ? 0.3 : 1),
          scale: isHidden ? 0.2 : (isMouseDown ? 0.6 : (cursorMode === 'magnetic' ? 0.8 : 1))
        }}
        transition={{
          scale: { type: 'spring', stiffness: 500, damping: 25 },
          opacity: { duration: 0.15 }
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: colors.dotCenter,
            display: 'block'
          }}
        />
      </motion.div>

      {/* 2. Fluid Organic Follower (Morphing Ring / Magnetic Capsule / Lens / I-Beam) */}
      <motion.div
        className="advanced-cursor-follower"
        style={{
          x: followerX,
          y: followerY,
          width: followerW,
          height: followerH,
          borderRadius: followerR,
          scaleX: cursorMode === 'default' ? scaleXSpring : (isMouseDown ? 0.92 : 1),
          scaleY: cursorMode === 'default' ? scaleYSpring : (isMouseDown ? 0.92 : 1),
          rotate: cursorMode === 'default' ? rotationSpring : 0,
          opacity: isHidden ? 0 : 1,
          borderWidth: cursorMode === 'text' ? '0px' : '1.5px',
          borderStyle: 'solid',
          borderColor: cursorMode === 'magnetic' ? colors.hoverBorder : (cursorMode === 'explore' ? colors.badgeBorder : colors.ringBorder),
          backgroundColor: cursorMode === 'magnetic' ? colors.hoverBg : (cursorMode === 'explore' ? colors.badgeBg : colors.ringBg),
          boxShadow: cursorMode === 'explore' ? '0 8px 24px rgba(0, 0, 0, 0.25)' : 'none'
        }}
      >
        {/* Mode-Specific Interactive Accents */}
        <AnimatePresence mode="wait">
          {cursorMode === 'explore' && (
            <motion.span
              key="badge"
              className="advanced-cursor-badge-text"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{ color: colors.badgeText }}
            >
              {badgeText}
            </motion.span>
          )}

          {cursorMode === 'drag' && (
            <motion.span
              key="drag"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.dot,
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}
            >
              ↕
            </motion.span>
          )}

          {cursorMode === 'text' && (
            <motion.div
              key="ibeam"
              className="advanced-cursor-ibeam"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ backgroundColor: colors.dot }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* 3. Click Ripples (tactile shockwave upon clicking) */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            className="advanced-cursor-ripple"
            initial={{
              x: r.x - 12,
              y: r.y - 12,
              width: 24,
              height: 24,
              opacity: 0.75,
              scale: 0.6
            }}
            animate={{
              x: r.x - 26,
              y: r.y - 26,
              width: 52,
              height: 52,
              opacity: 0,
              scale: 1.4
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onAnimationComplete={() => removeRipple(r.id)}
            style={{ borderColor: colors.ripple }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default AdvancedCursor;
