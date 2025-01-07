import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Routes from './Routes';
import { Box } from '@mui/material';

function App() {
  return (
    <Router>
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar />
        <Box sx={{ flex: 1, mt: '56px' }}>
          <Routes />
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
