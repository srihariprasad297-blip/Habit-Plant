import React from "react";

export default function PlantSVG({ stage = 0, withered = false }) {
  return (
    <div className="w-36 h-36 flex items-center justify-center">
      {withered ? (
        <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-6 opacity-80">
          <g>
            <rect x="42" y="60" width="6" height="28" fill="#6b4f2b" />
            <path d="M50 58 C30 55 40 35 30 28" stroke="#5b8a72" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M50 58 C70 55 60 35 70 28" stroke="#5b8a72" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="50" cy="88" rx="24" ry="6" fill="#b27a52" />
            <text x="50" y="18" fontSize="10" textAnchor="middle" fill="#7b1f1f">withered</text>
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 100 100" className="w-28 h-28">
          <g>
            <ellipse cx="50" cy="88" rx="24" ry="6" fill="#b27a52" />
            <rect x="48" y="60" width="4" height="28" fill="#6b4f2b" />
            {stage >= 1 && <path d="M50 58 C40 50 40 40 45 34" stroke="#3bbf87" strokeWidth="3" fill="none" strokeLinecap="round" />}
            {stage >= 2 && <path d="M50 58 C60 50 60 40 55 34" stroke="#2fae6b" strokeWidth="3" fill="none" strokeLinecap="round" />}
            {stage >= 3 && (
              <>
                <path d="M46 44 C36 35 28 28 24 24" stroke="#2c9c58" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M54 44 C64 35 72 28 76 24" stroke="#2c9c58" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
            {stage === 0 && <circle cx="50" cy="66" r="3" fill="#bdb76b" />}
          </g>
        </svg>
      )}
    </div>
  );
}
