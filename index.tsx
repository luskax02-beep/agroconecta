
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StatsigProvider } from 'statsig-react';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const statsigClientKey = import.meta.env.VITE_STATSIG_CLIENT_KEY || 'client-key-placeholder';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StatsigProvider sdkKey={statsigClientKey} waitForInitialization={false} user={{}}>
      <App />
    </StatsigProvider>
  </React.StrictMode>
);
