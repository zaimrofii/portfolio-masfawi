import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';

import App from '@/App';
import '@/styles/index.css';

async function aktifkanMocking() {
  const pakaiMock =
    import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === 'true';

  if (!pakaiMock) return;

  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
}

void aktifkanMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
});