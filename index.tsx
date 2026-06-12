
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StatsigProvider } from 'statsig-react';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const statsigClientKey = import.meta.env.VITE_STATSIG_CLIENT_KEY;

const root = ReactDOM.createRoot(rootElement);

if (statsigClientKey) {
  root.render(
    <React.StrictMode>
      <StatsigProvider sdkKey={statsigClientKey} waitForInitialization={false} user={{}}>
        <App />
      </StatsigProvider>
    </React.StrictMode>
  );
} else {
  console.warn("VITE_STATSIG_CLIENT_KEY is not set. StatsigProvider will not be loaded.");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
