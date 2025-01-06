import React from 'react';
import { AppBar, Toolbar, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'transparent',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              component="div" 
              onClick={() => navigate('/')} 
              sx={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img 
                src="https://imgur.com/PHbtv9x.png" 
                alt="Logo" 
                style={{ 
                  height: '70px', 
                  marginRight: '48px',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button 
                color="inherit" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' }
                }}
                onClick={() => navigate('/')}
              >
                Home
              </Button>
              <Button 
                color="inherit"
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' }
                }}
                onClick={() => navigate('/shop')}
              >
                Shop
              </Button>
              <Button 
                color="inherit"
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' }
                }}
                onClick={() => navigate('/bot')}
              >
                Bot
              </Button>
              <Button 
                color="inherit"
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' }
                }}
              >
                Support
              </Button>
              <Button 
                color="inherit"
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' }
                }}
              >
                Enterprise
              </Button>
              <Button 
                color="inherit"
                sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' }
                }}
              >
                Pricing
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit"
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: 'white' }
              }}
            >
              Login
            </Button>
            <Button 
              variant="contained"
              sx={{ 
                bgcolor: 'white',
                color: 'black',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                },
                borderRadius: '50px',
                px: 3
              }}
            >
              Sign up
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
