import React from 'react';
import { Send } from 'lucide-react';

interface PaperPlaneIconProps {
  size?: number;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PaperPlaneIcon({
  size = 18,
  className = '',
  style
}: PaperPlaneIconProps) {
  return (
    <Send
      size={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    />
  );
}

export default PaperPlaneIcon;
