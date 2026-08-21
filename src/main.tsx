import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary
        fallbackTitle="GameZay Escrow"
        fallbackMessage="An unexpected issue occurred while initializing the app. Please reload or click Return to Home."
      >
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
