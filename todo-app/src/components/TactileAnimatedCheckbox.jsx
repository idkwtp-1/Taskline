import React, { useState } from 'react';

export function TactileAnimatedCheckbox({ checked, onChange, ariaLabel = "Toggle task status" }) {
  const [isRippling, setIsRippling] = useState(false);

  const handleClick = (e) => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 500);
    onChange(e);
  };

  return (
    <label className="relative flex items-center justify-center cursor-pointer select-none shrink-0 group">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={handleClick}
        aria-label={ariaLabel}
        className="sr-only peer"
      />
      <div
        className={`w-5.5 h-5.5 rounded-lg border border-outline bg-surface/60 backdrop-blur-md transition-all duration-300 ease-out active:scale-85 flex items-center justify-center group-hover:border-primary group-hover:shadow-glow ${
          checked ? 'bg-primary border-primary shadow-glow' : ''
        } ${isRippling ? 'animate-ripple' : ''}`}
      >
        <svg
          className="w-3.5 h-3.5 text-on-primary pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline
            points="20 6 9 17 4 12"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: checked ? 0 : 24,
              transition: 'stroke-dashoffset 0.35s cubic-bezier(0.65, 0, 0.35, 1)',
            }}
          />
        </svg>
      </div>
    </label>
  );
}
