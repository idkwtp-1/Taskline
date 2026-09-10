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

// Auto-update Service Worker cache on launch
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.update();
    }
  });
}
