import React from 'react';

export function Sidebar({ currentTab, onSelectTab, onNewTask }) {
  const navItems = [
    { id: 'today', label: 'Today', icon: 'today' },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar_month' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="fixed left-0 top-[65px] h-[calc(100vh-65px)] w-[240px] hidden md:flex flex-col bg-surface-glass backdrop-blur-xl border-r border-border-glass z-20 p-4">
      {/* Navigation Links */}
      <div className="flex flex-col gap-2 flex-grow mt-2">
        {navItems.slice(0, 2).map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-on-primary font-bold shadow-glow scale-[1.02]'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {item.icon}
              </span>
              <span className="text-label-md font-label-md tracking-wide">{item.label}</span>
            </button>
          );
        })}

        {/* Settings button pinned at bottom of nav list */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 mt-auto ${
            currentTab === 'settings'
              ? 'bg-primary text-on-primary font-bold shadow-glow scale-[1.02]'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            settings
          </span>
          <span className="text-label-md font-label-md tracking-wide">Settings</span>
        </button>
      </div>

      {/* New Task Button */}
      <div className="mt-4 pb-2">
        <button
          onClick={() => onNewTask()}
          className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl text-label-md font-label-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-glow"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            add
          </span>
          New Task
        </button>
      </div>
    </nav>
  );
}
