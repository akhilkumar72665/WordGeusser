import React from 'react';

interface BrandMarkProps {
  className?: string;
}

/**
 * Four letter tiles: one solid, two outlined, one carmine.
 * It reads as a tiny parlour-game seal rather than a generic app icon.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ className = 'brand-mark' }) => (
  <svg
    className={className}
    viewBox="0 0 30 30"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="0.5" y="0.5" width="13" height="13" fill="currentColor" />
    <rect
      x="16.5"
      y="0.5"
      width="13"
      height="13"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect
      x="0.5"
      y="16.5"
      width="13"
      height="13"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect x="16.5" y="16.5" width="13" height="13" fill="#A22027" />
  </svg>
);
