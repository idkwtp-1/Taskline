import React from 'react';

export function BottomNav({ currentTab, onSelectTab, onNewTask }) {
  const navItems = [
    { id: 'today', label: 'Today', icon: 'today' },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar_month' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Floating Action Button (Mobile FAB with safe-area spacing) */}
      <button
        onClick={() => onNewTask()}
        className="md:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all shadow-glow focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
        aria-label="Create new task"
      >
        <span className="material-symbols-outlined text-3xl" aria-hidden="true">
          add
        </span>
      </button>

      {/* Bottom Navigation Bar (Mobile with safe-area padding) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom,0px)] bg-surface-glass backdrop-blur-2xl border-t border-border-glass shadow-2xl z-50 md:hidden"
      >
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '22px' }}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="text-label-md font-label-md mt-0.5 text-xs font-semibold">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
