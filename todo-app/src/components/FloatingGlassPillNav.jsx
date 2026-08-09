import React, { useRef, useState, useEffect } from 'react';

export function FloatingGlassPillNav({ currentTab, onSelectTab, onNewTask, counts = {} }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: 'today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar_month', count: counts.upcoming },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector(`[data-tab="${currentTab}"]`);
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [currentTab]);

  return (
    <nav
      ref={containerRef}
      aria-label="Main Navigation"
      className="relative flex items-center gap-1 p-1.5 rounded-full bg-surface-glass backdrop-blur-xl border border-border-glass shadow-lg transition-all duration-300"
    >
      {/* Dynamic Sliding Pill Indicator */}
      <div
        className="absolute top-1.5 bottom-1.5 bg-primary text-on-primary rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-glow"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />

      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onSelectTab(tab.id)}
            aria-label={`Navigate to ${tab.label}`}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-label-md font-label-md transition-colors duration-200 select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              isActive ? 'text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-on-primary/25 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
