import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/600.css';
import '@fontsource/geist/700.css';
import 'material-symbols/index.css';
import App from './App.jsx';
import Sandbox from './Sandbox.jsx';
import './index.css';

function checkIsSandbox() {
  return (
    window.location.pathname.includes('/sandbox') ||
    window.location.hash.includes('sandbox') ||
    window.location.search.includes('sandbox')
  );
}

function Root() {
  const [isSandbox, setIsSandbox] = useState(checkIsSandbox);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsSandbox(checkIsSandbox());
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  return isSandbox ? <Sandbox /> : <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// Enable keyboard reload (F5 / Ctrl+R) in desktop frameless window
window.addEventListener('keydown', (e) => {
  if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
    window.location.reload();
  }
});

// Manage Service Worker: on desktop launcher (127.0.0.1 / pywebview), unregister SW & clear caches so updates load immediately.
if ('serviceWorker' in navigator) {
  const isLocalDesktop =
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost' ||
    Boolean(window.pywebview);

  if (isLocalDesktop) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  } else {
    // In mobile PWA / remote web, auto-update and reload on new version
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.update();
      }
    });
  }
}
