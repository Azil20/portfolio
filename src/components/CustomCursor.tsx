import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

export interface CustomCursorProps {
  /** Size of the outer circle in pixels (default: 40) */
  circleSize?: number;
  /** Size of the inner dot in pixels (default: 6) */
  dotSize?: number;
  /** Color of the outer circle (default: theme accent) */
  circleColor?: string;
  /** Color of the inner dot (default: theme accent) */
  dotColor?: string;
  /** Spring stiffness for the outer circle (default: 150) */
  circleStiffness?: number;
  /** Spring damping for the outer circle (default: 20) */
  circleDamping?: number;
  /** Spring stiffness for the inner dot (default: 300) */
  dotStiffness?: number;
  /** Spring damping for the inner dot (default: 30) */
  dotDamping?: number;
  /** Border width of the outer circle in pixels (default: 2) */
  circleBorderWidth?: number;
  /** Additional class name for container */
  className?: string;
  /** Additional class name for circle */
  circleClassName?: string;
  /** Additional class name for dot */
  dotClassName?: string;
  /** Whether to show cursor on touch devices (default: false) */
  showOnTouch?: boolean;
  /** Z-index of the cursor (default: 9999) */
  zIndex?: number;
  /** Enable subtle elastic stretch in direction of movement (default: false) */
  elastic?: boolean;
  /** Padding between cursor and target element in pixels (default: 6) */
  targetPadding?: number;
  /** CSS selectors for target elements to trigger effects on hover */
  targets?: string[];
  /** Optional mix-blend-mode for cursor elements */
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
  /** Custom children inside cursor */
  children?: React.ReactNode;
}

const DEFAULT_TARGETS = [
  'a',
  'button',
  '.btn',
  '.clickable',
  '.timeline-tab-btn',
  '.lang-pill-btn',
  '.theme-toggle',
  '.footer-nav-link',
  '.footer-social-link',
  '.chat-send',
  '.chat-close',
  '.chat-header-btn',
  '.contact-action-btn',
  '.contact-cv-badge-btn'
];

export default function CustomCursor({
  circleSize = 36,
  dotSize = 7,
  circleColor,
  dotColor,
  circleStiffness = 240,
  circleDamping = 22,
  dotStiffness = 600,
  dotDamping = 32,
  circleBorderWidth = 2,
  className = '',
  circleClassName = '',
  dotClassName = '',
  showOnTouch = false,
  zIndex = 9999,
  elastic: _elastic = false,
  targetPadding = 5,
  targets = DEFAULT_TARGETS,
  mixBlendMode,
  children
}: CustomCursorProps) {
  const [isTouch, setIsTouch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isLightCursor, setIsLightCursor] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>('dark');

  // Detect theme dynamically if colors are not hardcoded
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

  const resolvedCircleColor = useMemo(() => {
    if (circleColor) return circleColor;
    return activeTheme === 'dark' ? 'rgba(56, 189, 248, 0.95)' : 'rgba(2, 132, 199, 0.95)';
  }, [circleColor, activeTheme]);

  const resolvedDotColor = useMemo(() => {
    if (dotColor) return dotColor;
    return activeTheme === 'dark' ? '#38bdf8' : '#0284c7';
  }, [dotColor, activeTheme]);

  const resolvedHoverBg = useMemo(() => {
    return activeTheme === 'dark' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.12)';
  }, [activeTheme]);

  // Motion values for dot (top-left aligned to keep center exactly at clientX, clientY)
  const dotTargetX = useMotionValue(-100);
  const dotTargetY = useMotionValue(-100);

  // Targets for outer ring (top-left aligned to keep center exactly at clientX, clientY or matched bounds)
  const ringTargetX = useMotionValue(-100);
  const ringTargetY = useMotionValue(-100);
  const ringTargetW = useMotionValue(circleSize);
  const ringTargetH = useMotionValue(circleSize);
  const ringTargetR = useMotionValue(circleSize / 2);

  // Springs
  const ringX = useSpring(ringTargetX, { stiffness: circleStiffness, damping: circleDamping });
  const ringY = useSpring(ringTargetY, { stiffness: circleStiffness, damping: circleDamping });
  const ringW = useSpring(ringTargetW, { stiffness: circleStiffness, damping: circleDamping });
  const ringH = useSpring(ringTargetH, { stiffness: circleStiffness, damping: circleDamping });
  const ringR = useSpring(ringTargetR, { stiffness: circleStiffness, damping: circleDamping });

  const dotX = useSpring(dotTargetX, { stiffness: dotStiffness, damping: dotDamping });
  const dotY = useSpring(dotTargetY, { stiffness: dotStiffness, damping: dotDamping });

  const currentHoverElRef = useRef<Element | null>(null);

  // Detect mobile or touch device and remove cursor completely
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

  // Add class on desktop to remove default operating system main cursor
  useEffect(() => {
    if (!isTouch) {
      document.body.classList.add('has-custom-cursor');
      document.documentElement.classList.add('has-custom-cursor');
      return () => {
        document.body.classList.remove('has-custom-cursor');
        document.documentElement.classList.remove('has-custom-cursor');
      };
    } else {
      document.body.classList.remove('has-custom-cursor');
      document.documentElement.classList.remove('has-custom-cursor');
    }
  }, [isTouch]);

  useEffect(() => {
    if (isTouch && !showOnTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Center the dot precisely at (clientX, clientY)
      dotTargetX.set(clientX - dotSize / 2);
      dotTargetY.set(clientY - dotSize / 2);

      if (!isVisible) setIsVisible(true);

      const targetElement = document.elementFromPoint(clientX, clientY);

      // 1. Check if hovering over the 3D model canvas wrapper
      const isModelCanvas = Boolean(targetElement?.closest('.chatbot-canvas-wrapper'));

      if (isModelCanvas) {
        setIsLightCursor(true);
        setIsHovered(true);
        setIsButtonHovered(false);
        currentHoverElRef.current = targetElement?.closest('.chatbot-canvas-wrapper') || null;

        const lightOrbSize = circleSize * 1.45; // ~52px glowing light orb
        ringTargetX.set(clientX - lightOrbSize / 2);
        ringTargetY.set(clientY - lightOrbSize / 2);
        ringTargetW.set(lightOrbSize);
        ringTargetH.set(lightOrbSize);
        ringTargetR.set(lightOrbSize / 2);
        return;
      }

      setIsLightCursor(false);

      // 2. Check if hovering over any target selector
      if (targetElement) {
        let matchedTarget: HTMLElement | null = null;
        for (const selector of targets) {
          const closest = targetElement.closest(selector) as HTMLElement | null;
          if (closest) {
            matchedTarget = closest;
            break;
          }
        }

        if (matchedTarget) {
          currentHoverElRef.current = matchedTarget;
          setIsHovered(true);

          const rect = matchedTarget.getBoundingClientRect();
          const computed = window.getComputedStyle(matchedTarget);
          const computedRadius = parseFloat(computed.borderRadius) || 12;

          // Only morph into a bounding box frame for compact interactive elements (buttons, pills, tabs, badges)
          // Elements larger than 260px wide or 80px tall must NEVER stretch into a giant box!
          const isCompact = rect.width <= 260 && rect.height <= 80;

          if (isCompact) {
            setIsButtonHovered(true);
            const targetWidth = rect.width + targetPadding * 2;
            const targetHeight = rect.height + targetPadding * 2;
            const targetLeft = rect.left - targetPadding;
            const targetTop = rect.top - targetPadding;

            ringTargetX.set(targetLeft);
            ringTargetY.set(targetTop);
            ringTargetW.set(targetWidth);
            ringTargetH.set(targetHeight);
            ringTargetR.set(computedRadius + targetPadding);
          } else {
            setIsButtonHovered(false);
            // For larger clickable elements (cards or wide items), keep cursor circular, centered on mouse pointer
            const swellSize = circleSize * 1.35;
            ringTargetX.set(clientX - swellSize / 2);
            ringTargetY.set(clientY - swellSize / 2);
            ringTargetW.set(swellSize);
            ringTargetH.set(swellSize);
            ringTargetR.set(swellSize / 2);
          }
          return;
        }
      }

      // Not hovering any target
      if (isHovered) {
        setIsHovered(false);
        setIsButtonHovered(false);
        currentHoverElRef.current = null;
      }

      // Outer ring centered exactly at (clientX, clientY)
      ringTargetX.set(clientX - circleSize / 2);
      ringTargetY.set(clientY - circleSize / 2);
      ringTargetW.set(circleSize);
      ringTargetH.set(circleSize);
      ringTargetR.set(circleSize / 2);
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsButtonHovered(false);
      setIsLightCursor(false);
    };
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
    };
  }, [
    isTouch,
    showOnTouch,
    isVisible,
    isHovered,
    isLightCursor,
    targets,
    targetPadding,
    circleSize,
    dotSize,
    dotTargetX,
    dotTargetY,
    ringTargetX,
    ringTargetY,
    ringTargetW,
    ringTargetH,
    ringTargetR
  ]);

  if (isTouch && !showOnTouch) {
    return null;
  }

  return (
    <div
      className={`custom-cursor-container ${className}`}
      style={{ zIndex, mixBlendMode }}
      aria-hidden="true"
    >
      {/* Morphing Outer Ring */}
      <motion.div
        className={`custom-cursor-ring ${isLightCursor ? 'is-light-mode' : ''} ${circleClassName}`}
        style={{
          x: ringX,
          y: ringY,
          width: ringW,
          height: ringH,
          borderRadius: ringR,
          borderWidth: `${circleBorderWidth}px`,
          borderColor: isLightCursor ? 'rgba(96, 165, 250, 0.95)' : resolvedCircleColor,
          backgroundColor: isLightCursor
            ? 'rgba(0, 56, 255, 0.22)'
            : (isHovered ? resolvedHoverBg : 'transparent'),
          opacity: isVisible ? 1 : 0,
          scale: isMouseDown ? 0.92 : 1
        }}
      >
        {children}
      </motion.div>

      {/* Inner Dot - hides when hovering inside a button, becomes glowing light filament core on 3D model */}
      <motion.div
        className={`custom-cursor-dot ${isLightCursor ? 'is-light-mode' : ''} ${dotClassName}`}
        style={{
          x: dotX,
          y: dotY,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          backgroundColor: isLightCursor ? '#ffffff' : resolvedDotColor,
          opacity: isVisible ? (isButtonHovered && !isLightCursor ? 0 : 1) : 0,
          scale: isButtonHovered && !isLightCursor ? 0 : (isLightCursor ? 1.35 : (isMouseDown ? 0.75 : 1))
        }}
        transition={{
          scale: { duration: 0.16, ease: 'easeOut' },
          opacity: { duration: 0.14, ease: 'easeOut' }
        }}
      />
    </div>
  );
}
