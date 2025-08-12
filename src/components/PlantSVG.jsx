import React from "react";

/**
 * PlantSVG shows different plant stages.
 * props:
 *  - stage: 0..3
 *  - withered: boolean
 */
export default function PlantSVG({ stage = 0, withered = false, size = 96 }) {
  const w = size;
  const h = size;
  if (withered) {
    return (
      <svg width={w} height={h} viewBox="0 0 100 100" className="drop-shadow">
        <g transform="rotate(-6 50 50)" opacity="0.85">
          <rect x="42" y="60" width="6" height="28" fill="#7b5538" />
          <path d="M50 58 C30 55 40 35 30 28" stroke="#7c9b86" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50 58 C70 55 60 35 70 28" stroke="#7c9b86" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="88" rx="24" ry="6" fill="#b27a52" />
        </g>
        <text x="50" y="18" fontSize="8" textAnchor="middle" fill="#7b1f1f">withered</text>
      </svg>
    );
  }

  return (
    <svg width={w} height={h} viewBox="0 0 100 100" className="drop-shadow">
      <g>
        <ellipse cx="50" cy="88" rx="26" ry="7" fill="#bf8a5f" />
        <rect x="48" y="60" width="4" height="28" fill="#6a4a2f" />
        {stage >= 1 && <path d="M50 58 C40 50 40 40 45 34" stroke="#39b98f" strokeWidth="3" fill="none" strokeLinecap="round" />}
        {stage >= 2 && <path d="M50 58 C60 50 60 40 55 34" stroke="#2fae6b" strokeWidth="3" fill="none" strokeLinecap="round" />}
        {stage >= 3 && (
          <>
            <path d="M46 44 C36 35 28 28 24 24" stroke="#2c9c58" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M54 44 C64 35 72 28 76 24" stroke="#2c9c58" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}
        {stage === 0 && <circle cx="50" cy="66" r="3.5" fill="#d4d06b" />}
      </g>
    </svg>
  );
}
