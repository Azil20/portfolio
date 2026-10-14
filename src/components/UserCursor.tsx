import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './UserCursor.css';

export interface UserCursorProps {
  /** Solid fill color of the cursor arrow (default: #4d64f4 as shown in picture) */
  color?: string;
  /** Arrow size in pixels (default: 26) */
  size?: number;
  /** Spring stiffness for movement (default: 550) */
  stiffness?: number;
  /** Spring damping for movement (default: 32) */
  damping?: number;
  /** Additional container class name */
  className?: string;
  /** Z-index of the cursor layer (default: 9999) */
  zIndex?: number;
  /** Whether to show cursor on touch devices (default: false) */
  showOnTouch?: boolean;
  /** Padding between bounding box frame and target element (default: 5) */
  targetPadding?: number;
  /** Target selectors for magnetic hover and morphing frame */
  targets?: string[];
  /** Optional collaborator name tag */
  name?: string;
  /** Whether to display the name tag (default: false to match exact picture) */
  showLabel?: boolean;
}

const DEFAULT_TARGETS = [
  'a',
  'button',
  '.btn',
  '.clickable',
  '.project-card',
  '.faq-question-btn',
  '.chat-inquiry-card',
  '.timeline-tab-btn',
  '.lang-pill-btn',
  '.theme-toggle',
  '.footer-nav-link',
  '.footer-social-link',
  '.chat-send',
  '.chat-close',
  '.chat-header-btn',
  '.contact-action-btn',
  '.contact-cv-badge-btn',
  '.chat-starter-chip',
  '.form-fallback-mailto-btn'
];

export function UserCursor({
  color,
  size = 26,
  stiffness = 550,
  damping = 32,
  className = '',
  zIndex = 9999,
  showOnTouch = false,
  targetPadding = 5,
  targets = DEFAULT_TARGETS,
  name = 'Med',
  showLabel = false
}: UserCursorProps) {
  const [isTouch, setIsTouch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isOverModel, setIsOverModel] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>('dark');

  // Detect theme dynamically
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

  // Exact vibrant blue from the user's reference picture (#4d64f4 / #3b82f6)
  const resolvedColor = useMemo(() => {
    if (color) return color;
    return activeTheme === 'dark' ? '#4d64f4' : '#2563eb';
  }, [color, activeTheme]);

  const resolvedHoverBg = useMemo(() => {
    return activeTheme === 'dark' ? 'rgba(77, 100, 244, 0.14)' : 'rgba(37, 99, 235, 0.1)';
  }, [activeTheme]);

  // Motion values for the Arrow (hotspot is top-left tip at clientX, clientY)
  const arrowTargetX = useMotionValue(-100);
  const arrowTargetY = useMotionValue(-100);

  // Targets for the morphing bounding box frame around compact buttons
  const frameTargetX = useMotionValue(-100);
  const frameTargetY = useMotionValue(-100);
  const frameTargetW = useMotionValue(size);
  const frameTargetH = useMotionValue(size);
  const frameTargetR = useMotionValue(8);

  // Springs for smooth organic movement
  const arrowX = useSpring(arrowTargetX, { stiffness, damping });
  const arrowY = useSpring(arrowTargetY, { stiffness, damping });

  const frameX = useSpring(frameTargetX, { stiffness: stiffness * 0.5, damping: damping * 0.85 });
  const frameY = useSpring(frameTargetY, { stiffness: stiffness * 0.5, damping: damping * 0.85 });
  const frameW = useSpring(frameTargetW, { stiffness: stiffness * 0.5, damping: damping * 0.85 });
  const frameH = useSpring(frameTargetH, { stiffness: stiffness * 0.5, damping: damping * 0.85 });
  const frameR = useSpring(frameTargetR, { stiffness: stiffness * 0.5, damping: damping * 0.85 });

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

  // Remove native system cursor on desktop
  useEffect(() => {
    if (!isTouch) {
      document.body.classList.add('has-user-cursor');
      document.documentElement.classList.add('has-user-cursor');
      return () => {
        document.body.classList.remove('has-user-cursor');
        document.documentElement.classList.remove('has-user-cursor');
      };
    } else {
      document.body.classList.remove('has-user-cursor');
      document.documentElement.classList.remove('has-user-cursor');
    }
  }, [isTouch]);

  useEffect(() => {
    if (isTouch && !showOnTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // Position the arrow hotspot precisely at (clientX, clientY)
      arrowTargetX.set(clientX);
      arrowTargetY.set(clientY);

      if (!isVisible) setIsVisible(true);

      const targetElement = document.elementFromPoint(clientX, clientY);

      // 1. Pointing at the 3D model canvas: HIDE cursor completely so only the chrome lighting lives!
      const isModelCanvas = Boolean(targetElement?.closest('.chatbot-canvas-wrapper'));

      if (isModelCanvas) {
        setIsOverModel(true);
        setIsHovered(false);
        setIsButtonHovered(false);
        currentHoverElRef.current = targetElement?.closest('.chatbot-canvas-wrapper') || null;

        // Keep frame aligned so when leaving the 3D model it smoothly re-emerges
        frameTargetX.set(clientX);
        frameTargetY.set(clientY);
        frameTargetW.set(size);
        frameTargetH.set(size);
        frameTargetR.set(8);
        return;
      }

      setIsOverModel(false);

      // 2. Check if hovering over any interactive target selector
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

          // Morph into bounding box frame for compact buttons (buttons, pills, badges)
          const isCompact = rect.width <= 260 && rect.height <= 80;

          if (isCompact) {
            setIsButtonHovered(true);
            const targetWidth = rect.width + targetPadding * 2;
            const targetHeight = rect.height + targetPadding * 2;
            const targetLeft = rect.left - targetPadding;
            const targetTop = rect.top - targetPadding;

            frameTargetX.set(targetLeft);
            frameTargetY.set(targetTop);
            frameTargetW.set(targetWidth);
            frameTargetH.set(targetHeight);
            frameTargetR.set(computedRadius + targetPadding);
          } else {
            setIsButtonHovered(false);
            frameTargetX.set(clientX - 16);
            frameTargetY.set(clientY - 16);
            frameTargetW.set(32);
            frameTargetH.set(32);
            frameTargetR.set(16);
          }
          return;
        }
      }

      // Not hovering any interactive target
      if (isHovered) {
        setIsHovered(false);
        setIsButtonHovered(false);
        currentHoverElRef.current = null;
      }

      frameTargetX.set(clientX);
      frameTargetY.set(clientY);
      frameTargetW.set(size);
      frameTargetH.set(size);
      frameTargetR.set(8);
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsButtonHovered(false);
      setIsOverModel(false);
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
    isOverModel,
    targets,
    targetPadding,
    size,
    arrowTargetX,
    arrowTargetY,
    frameTargetX,
    frameTargetY,
    frameTargetW,
    frameTargetH,
    frameTargetR
  ]);

  if (isTouch && !showOnTouch) {
    return null;
  }

  const svgHeight = Math.round((size * 20) / 26);

  return (
    <div
      className={`user-cursor-container ${className}`}
      style={{ zIndex }}
      aria-hidden="true"
    >
      {/* Morphing Button Frame (wraps buttons on hover, hides inside 3D model) */}
      <motion.div
        className="user-cursor-frame"
        style={{
          x: frameX,
          y: frameY,
          width: frameW,
          height: frameH,
          borderRadius: frameR,
          borderColor: resolvedColor,
          backgroundColor: isHovered ? resolvedHoverBg : 'transparent',
          opacity: isVisible && isButtonHovered && !isOverModel ? 1 : 0,
          scale: isOverModel ? 0.25 : 1
        }}
        transition={{
          opacity: { duration: 0.16, ease: 'easeOut' },
          scale: { duration: 0.16, ease: 'easeOut' }
        }}
      />

      {/* Main User Cursor Arrow Pointer (matching the reference picture exactly) */}
      <motion.div
        className="user-cursor-arrow-wrap"
        style={{
          x: arrowX,
          y: arrowY,
          opacity: isVisible && !isButtonHovered && !isOverModel ? 1 : 0,
          scale: isOverModel ? 0.2 : (isMouseDown ? 0.88 : 1)
        }}
        transition={{
          opacity: { duration: 0.14, ease: 'easeOut' },
          scale: { duration: 0.14, ease: 'easeOut' }
        }}
      >
        <svg
          width={size}
          height={svgHeight}
          viewBox="0 0 26 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="user-cursor-svg"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25))'
          }}
        >
          {/* Exact geometry of the blue pointer arrow from reference picture */}
          <path
            d="M0 0 H25 C24.5 1.5 22.8 3.5 20.8 5.2 C18.8 6.9 17 8.2 17 10 V19.5 L0 0 Z"
            fill={resolvedColor}
          />
        </svg>

        {/* Optional Collaborator Name Tag */}
        {showLabel && (
          <span
            className="user-cursor-label"
            style={{
              backgroundColor: resolvedColor,
              color: '#ffffff'
            }}
          >
            {name}
          </span>
        )}
      </motion.div>
    </div>
  );
}

export default UserCursor;
