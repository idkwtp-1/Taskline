import React from 'react';

export function RadialTaskGauge({ completedCount = 0, totalCount = 0, size = 96 }) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-4 bg-surface-glass backdrop-blur-xl border border-border-glass p-3.5 rounded-2xl shadow-lg">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--tertiary))" />
            </linearGradient>
          </defs>
          {/* Background Track Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-surface-container-highest"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Glowing Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))',
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-body-md font-headline-md font-bold text-on-surface tracking-tight font-mono">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-mono-label font-mono-label font-bold text-on-surface uppercase tracking-wider">
          Task Velocity
        </span>
        <span className="text-body-sm text-on-surface-variant mt-0.5 font-medium">
          {completedCount} of {totalCount} completed
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${percentage === 100 ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} />
          <span className="text-mono-label text-xs text-on-surface-variant font-mono">
            {percentage === 100 ? 'All Tasks Cleared!' : `${totalCount - completedCount} remaining`}
          </span>
        </div>
      </div>
    </div>
  );
}
