import React from 'react';

export function BottomNav({ currentTab, onSelectTab, onNewTask }) {
  const navItems = [
    { id: 'today', label: 'Today', icon: 'today' },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar_month' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Floating Action Button (Mobile FAB) */}
      <button
        onClick={() => onNewTask()}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-primary-container text-on-primary-container rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all"
        aria-label="Add new task"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-surface-container-low border-t border-outline-variant shadow-lg z-50 md:hidden">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                {item.icon}
              </span>
              <span className="text-label-md font-label-md mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
