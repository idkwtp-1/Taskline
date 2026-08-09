import React from 'react';

export function AmbientGlowThemeToggle({ isDarkMode, onToggleTheme }) {
  return (
    <button
      onClick={onToggleTheme}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative w-14 h-8 rounded-full p-1 transition-all duration-500 ease-out border border-border-glass cursor-pointer ${
        isDarkMode
          ? 'bg-surface-container-highest shadow-[0_0_20px_rgba(99,102,241,0.45)]'
          : 'bg-surface-container shadow-[0_0_20px_rgba(251,191,36,0.35)]'
      }`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Sliding Switch Knob */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode
            ? 'translate-x-6 bg-primary text-on-primary'
            : 'translate-x-0 bg-amber-400 text-slate-950'
        }`}
      >
        <span
          className={`material-symbols-outlined transition-transform duration-500 ${
            isDarkMode ? 'rotate-180' : 'rotate-0'
          }`}
          style={{ fontSize: '16px' }}
        >
          {isDarkMode ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
    </button>
  );
}
