import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure custom font is registered in document.fonts for mobile WebKit/Blink SVG rendering
if (typeof window !== 'undefined' && 'fonts' in document) {
  try {
    const fzFont = new FontFace('FZFYSJW', 'url(/fonts/FZFYSJW.TTF)');
    fzFont.load().then((loaded) => {
      document.fonts.add(loaded);
    }).catch(() => {});
  } catch {}
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
