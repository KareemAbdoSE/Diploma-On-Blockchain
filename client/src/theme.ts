// src/theme.ts

import { createTheme } from '@mui/material/styles';

// Define your custom theme configuration
const theme = createTheme({
  // You can customize the theme here
  palette: {
    primary: {
      main: '#1976d2', // Customize primary color
    },
    secondary: {
      main: '#dc004e', // Customize secondary color
    },
  },
  typography: {
    // Customize typography here
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;
