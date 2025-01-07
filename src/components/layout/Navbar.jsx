import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShopPanel from '../ShopPanel';

const Navbar = () => {
  const navigate = useNavigate();
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: '#000000 !important',
        background: '#000000 !important',
        boxShadow: 'none',
        height: '56px',
        display: 'flex',
        justifyContent: 'center',
        backdropFilter: 'none'
      }}
    >
      <Container 
        maxWidth={false}
        sx={{
          maxWidth: '1400px',
          margin: '0 auto',
          px: { xs: 4, sm: 6, md: 8 },
          height: '100%'
        }}
      >
        <Toolbar 
          disableGutters
          sx={{ 
            height: '100%',
            minHeight: '56px !important',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          {/* Left section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-start',
            gap: 6
          }}>
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
                  height: '32px',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Box>

          {/* Center section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2.5,
            flex: 2
          }}>
            <Button 
              color="inherit" 
              sx={{ 
                color: 'rgba(255,255,255,0.65)',
                '&:hover': { color: 'white' },
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 400,
                minWidth: 'auto',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1
              }}
            >
              Features
            </Button>
            <Button 
              color="inherit"
              sx={{ 
                color: 'rgba(255,255,255,0.65)',
                '&:hover': { color: 'white' },
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 400,
                minWidth: 'auto',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1
              }}
            >
              Resources
            </Button>
            <Button 
              color="inherit"
              sx={{ 
                color: 'rgba(255,255,255,0.65)',
                '&:hover': { color: 'white' },
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 400,
                minWidth: 'auto',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1
              }}
            >
              Support
            </Button>
            <Button 
              color="inherit"
              sx={{ 
                color: 'rgba(255,255,255,0.65)',
                '&:hover': { color: 'white' },
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 400,
                minWidth: 'auto',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1
              }}
            >
              Enterprise
            </Button>
            <Button 
              color="inherit"
              sx={{ 
                color: 'rgba(255,255,255,0.65)',
                '&:hover': { color: 'white' },
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 400,
                minWidth: 'auto',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1
              }}
            >
              Pricing
            </Button>
            <Button 
              color="inherit"
              sx={{ 
                color: 'rgba(255,255,255,0.65)',
                '&:hover': { color: 'white' },
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 400,
                minWidth: 'auto',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1
              }}
            >
              Contact
            </Button>
            <Button 
              color="inherit"
              sx={{ 
                color: 'rgba(255,255,255,0.65)',
                '&:hover': { color: 'white' },
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 400,
                minWidth: 'auto',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1,
                position: 'relative'
              }}
              onMouseEnter={() => setIsShopOpen(true)}
              onMouseLeave={() => setIsShopOpen(false)}
            >
              Shop
              <Box
                onMouseEnter={() => setIsShopOpen(true)}
                onMouseLeave={() => setIsShopOpen(false)}
                sx={{ position: 'absolute', width: '100vw', left: '50%', transform: 'translateX(-50%)' }}
              >
                <ShopPanel isOpen={isShopOpen} />
              </Box>
            </Button>
          </Box>

          {/* Right section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 2,
            flex: 1
          }}>
            <Button 
              color="inherit"
              sx={{ 
                color: 'rgba(255,255,255,0.65)',
                '&:hover': { color: 'white' },
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 400,
                minWidth: 'auto',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1
              }}
            >
              Login
            </Button>
            <Button 
              variant="contained"
              sx={{ 
                bgcolor: 'white',
                color: '#000',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)'
                },
                borderRadius: '50px',
                px: 3,
                py: 1,
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 500,
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
