import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';  // Asegúrate de importar el componente
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpeedInsights />  {/* Agregar este componente aquí */}
    <App />
  </StrictMode>
);
