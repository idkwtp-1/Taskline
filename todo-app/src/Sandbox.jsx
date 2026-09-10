import React, { useState, useMemo, useEffect } from 'react';
import { SandboxRegistry } from './components/sandbox/SandboxRegistry';

export default function Sandbox() {
  const components = useMemo(() => SandboxRegistry(), []);
  const [selectedId, setSelectedId] = useState(() => components[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  // Dark/Light theme toggle inside sandbox
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('taskline-theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('taskline-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return components;
    const q = searchQuery.toLowerCase();
    return components.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [components, searchQuery]);

  // Group by category
  const categories = useMemo(() => {
    const map = new Map();
    for (const comp of filteredComponents) {
      if (!map.has(comp.category)) {
        map.set(comp.category, []);
      }
      map.get(comp.category).push(comp);
    }
    return Array.from(map.entries());
  }, [filteredComponents]);

  const activeComponent =
    components.find((c) => c.id === selectedId) || components[0];

  const getViewportContainerClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-full max-w-[390px] border border-border-glass rounded-[38px] shadow-2xl overflow-hidden min-h-[780px] bg-background flex flex-col relative ring-8 ring-black/40';
      case 'tablet':
        return 'w-full max-w-[768px] border border-border-glass rounded-3xl shadow-xl overflow-hidden min-h-[640px] bg-background flex flex-col relative ring-4 ring-black/20';
      case 'desktop':
      default:
        return 'w-full max-w-6xl mx-auto';
    }
  };

  const handleReturnToApp = () => {
    // Return to main app without sandbox hash or path
    if (window.location.hash.includes('sandbox')) {
      window.location.hash = '';
    } else if (window.location.search.includes('sandbox')) {
      window.location.search = '';
    } else {
      window.location.pathname = '/';
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-on-background overflow-hidden font-sans selection:bg-primary/30">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-border-glass flex flex-col bg-surface-container-low/70 backdrop-blur-xl shrink-0 z-20">
        {/* Header */}
        <div className="p-4 border-b border-border-glass space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-glow">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  science
                </span>
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-on-surface">
                  UI Sandbox
                </h1>
                <p className="text-[11px] text-on-surface-variant font-medium">
                  Component Studio
                </p>
              </div>
            </div>

            <button
              onClick={handleReturnToApp}
              className="p-1.5 px-2.5 rounded-lg bg-surface-container-high/80 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-all text-xs flex items-center gap-1 border border-border-glass font-medium cursor-pointer"
              title="Return to Main App"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                arrow_back
              </span>
              <span>App</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none"
              style={{ fontSize: '16px' }}
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter components…"
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container border border-border-glass rounded-lg text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
          </div>
        </div>

        {/* Categories & Components List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {categories.map(([category, items]) => (
            <div key={category} className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 flex items-center justify-between">
                <span>{category}</span>
                <span className="text-[9px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant/60 font-mono">
                  {items.length}
                </span>
              </div>

              <div className="space-y-1">
                {items.map((item) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-on-primary font-bold shadow-glow scale-[1.01]'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      <span
                        className={`material-symbols-outlined transition-transform ${
                          isSelected
                            ? 'text-on-primary translate-x-0.5'
                            : 'text-on-surface-variant/30 group-hover:text-on-surface-variant'
                        }`}
                        style={{ fontSize: '15px' }}
                      >
                        chevron_right
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredComponents.length === 0 && (
            <div className="text-center py-10 text-xs text-on-surface-variant/60">
              No matching components found.
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border-glass text-[11px] text-on-surface-variant flex items-center justify-between bg-surface-container-low/50">
          <span>{components.length} Total Previews</span>
          <span className="flex items-center gap-1 text-primary font-medium">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              auto_awesome
            </span>
            Isolated Studio
          </span>
        </div>
      </aside>

      {/* Main Sandbox Stage */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest overflow-hidden">
        {/* Stage Header */}
        <header className="h-14 border-b border-border-glass px-6 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 rounded-lg bg-surface-container border border-border-glass text-primary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                layers
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2 truncate">
                <span>{activeComponent?.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-normal">
                  {activeComponent?.category}
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant truncate max-w-xl">
                {activeComponent?.description}
              </p>
            </div>
          </div>

          {/* Controls: Viewport + Theme Switcher */}
          <div className="flex items-center gap-3">
            {/* Viewport controls */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-border-glass shadow-sm">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                  viewport === 'desktop'
                    ? 'bg-primary text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Desktop View (100% fluid)"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  desktop_windows
                </span>
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                  viewport === 'tablet'
                    ? 'bg-primary text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Tablet View (768px)"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  tablet_mac
                </span>
                <span className="hidden sm:inline">Tablet</span>
              </button>

              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                  viewport === 'mobile'
                    ? 'bg-primary text-on-primary shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Mobile View (390px)"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  phone_iphone
                </span>
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-surface-container border border-border-glass text-on-surface-variant hover:text-on-surface transition cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </header>

        {/* Stage Content Area */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start bg-background/50">
          <div className={`${getViewportContainerClass()} transition-all duration-300`}>
            {/* Phone speaker / camera notch simulation for mobile */}
            {viewport === 'mobile' && (
              <div className="w-full flex justify-center pt-2.5 pb-1 bg-surface-container-low shrink-0 select-none">
                <div className="w-24 h-4 bg-black/40 rounded-full flex items-center justify-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-black/60" />
                  <div className="w-8 h-1.5 rounded-full bg-black/60" />
                </div>
              </div>
            )}

            {/* Render Component Content */}
            <div className="p-4 flex-1 overflow-y-auto w-full">
              {activeComponent ? (
                activeComponent.render()
              ) : (
                <div className="text-center py-20 text-on-surface-variant/50">
                  Select a component from the sidebar to inspect.
                </div>
              )}
            </div>

            {/* Home bar indicator for mobile */}
            {viewport === 'mobile' && (
              <div className="w-full flex justify-center py-1.5 bg-surface-container-low shrink-0 select-none">
                <div className="w-28 h-1 bg-on-surface-variant/30 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
