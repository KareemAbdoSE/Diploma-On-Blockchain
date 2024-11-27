// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import Material-UI ThemeProvider and your theme
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Optional, for consistent styling
import theme from './theme'; // Import your theme

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Optional, resets CSS for consistent styling */}
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}
