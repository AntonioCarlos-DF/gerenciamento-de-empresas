import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <React.StrictMode>
      <AppRoutes />
    </React.StrictMode>
  );