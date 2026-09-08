import React, { useState, useEffect } from 'react';

export function IosInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Detect iOS / iPadOS Safari and check if already running in standalone PWA mode
    const isIos = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent))) && !window.MSStream;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = localStorage.getItem('taskline-ios-banner-dismissed') === 'true';

    if (isIos && !isStandalone && !isDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('taskline-ios-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-primary-container text-on-primary-container p-3 px-4 flex items-center justify-between shadow-md border-b border-primary/30 z-30">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl shrink-0">
          ios_share
        </span>
        <div className="text-body-sm">
          <span className="font-semibold">Install TaskLine on iOS / iPad: </span>
          <span>
            Tap <span className="font-bold underline">Share</span> below then select{' '}
            <span className="font-bold underline">"Add to Home Screen"</span> for full PWA experience.
          </span>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 text-on-primary-container hover:opacity-80 transition-opacity ml-2 shrink-0"
        aria-label="Dismiss banner"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          close
        </span>
      </button>
    </div>
  );
}
