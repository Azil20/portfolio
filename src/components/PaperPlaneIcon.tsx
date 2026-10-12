import React from 'react';

interface PaperPlaneIconProps {
  size?: number;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PaperPlaneIcon({
  size = 18,
  filled = true,
  className = '',
  style
}: PaperPlaneIconProps) {
  if (filled) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
        aria-hidden="true"
      >
        {/* Telegram-style sleek solid paper airplane with aerodynamic fold cutout */}
        <path d="M21.82 2.22a1.2 1.2 0 0 0-1.24-.26L2.6 9.68a1.2 1.2 0 0 0 .08 2.28l5.22 1.62 11.77-7.42c.36-.23.77.22.46.53L10.3 15.65l-.4 5.06a1.2 1.2 0 0 0 2.05.85l2.7-2.6 4.98 3.68a1.2 1.2 0 0 0 1.9-.66l3.37-15.88a1.2 1.2 0 0 0-.88-1.52z" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Telegram-style outline paper airplane with center crease */}
      <path d="M21.5 2.5L10.5 13.5" />
      <path d="M21.5 2.5L14.5 21.5L10.5 13.5L2.5 9.5L21.5 2.5Z" />
    </svg>
  );
}

export default PaperPlaneIcon;
