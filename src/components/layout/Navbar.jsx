import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Container, Button } from '@mui/material';
import GameSelector from '../GameSelector';
import FortniteMenu from '../FortniteMenu';
import ShopPanel from '../ShopPanel';

const Navbar = () => {
  const [currentMenu, setCurrentMenu] = useState(null); // 'games', 'fortnite', 'shop'
  const [selectedGame, setSelectedGame] = useState(null);

  const handleShopClick = (event) => {
    event.stopPropagation();
    setCurrentMenu(currentMenu === 'games' ? null : 'games');
  };

  const handleGameSelect = (game, event) => {
    event.stopPropagation();
    setSelectedGame(game);
    
    if (game === 'fortnite') {
      setCurrentMenu('fortnite');
    } else {
      setCurrentMenu(null);
    }
  };

  const handleFortniteOptionSelect = (option) => {
    if (option === 'daily-shop') {
      setCurrentMenu('shop');
    }
  };

  const handleClickOutside = () => {
    setCurrentMenu(null);
  };

  return (
    <Box onClick={handleClickOutside}>
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
                onClick={handleShopClick}
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
              >
                {currentMenu === 'fortnite' ? 'Daily Shop' : 
                 currentMenu === 'shop' ? 'Close Shop' : 'Shop'}
                
                <Box sx={{ position: 'absolute', top: '100%', right: 0 }}>
                  {currentMenu === 'shop' ? (
                    <ShopPanel isOpen={true} />
                  ) : (
                    <Box sx={{ position: 'absolute', top: '100%', left: 0 }}>
                      {currentMenu === 'games' && (
                        <GameSelector 
                          isOpen={true}
                          onGameSelect={handleGameSelect}
                        />
                      )}

                      {currentMenu === 'fortnite' && (
                        <FortniteMenu
                          isOpen={true}
                          onOptionSelect={handleFortniteOptionSelect}
                        />
                      )}
                    </Box>
                  )}
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
    </Box>
  );
};

export default Navbar;
