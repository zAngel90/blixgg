import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import DailyShop from '../components/DailyShop';

const Home = () => {
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const skins = [
    "https://media.fortniteapi.io/images/3e14be11637fab7c61c422d6abf45eb1/transparent.png",
    "https://media.fortniteapi.io/images/d96960f39af497b38a8975795b061d86/transparent.png",
    "https://media.fortniteapi.io/images/2da5bc4dc429b7784e950aa177ba9dd5/transparent.png",
    "https://media.fortniteapi.io/images/1eb15ba06d3eb15db029099f1b732145/transparent.png",
    "https://media.fortniteapi.io/images/5da473806c93186183171b64b37d1eaa/transparent.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSkinIndex((prevIndex) => (prevIndex + 1) % skins.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#000000',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '1400px',
          px: { xs: 4, sm: 6, md: 10 },
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 4, md: 8 },
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          <Box sx={{ flex: 1, maxWidth: '600px' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '40px', sm: '64px', md: '80px' },
                fontWeight: 600,
                color: 'white',
                lineHeight: 1.1,
                mb: 3
              }}
            >
              BLIX GG
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '18px', sm: '20px', md: '24px' },
                color: 'rgba(255,255,255,0.7)',
                mb: 4,
                maxWidth: '600px'
              }}
            >
              Your ultimate destination for V-Bucks and Robux. Get the best deals on gaming currency for Fortnite and Roblox.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #00ff00 30%, #4CAF50 90%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 500,
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4CAF50 30%, #00ff00 90%)',
                    boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)'
                  },
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Start for free
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 500,
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Learn more
              </Button>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 3,
              mt: 2,
              alignItems: 'center'
            }}>
              <Box 
                component="a"
                href="https://discord.gg/tuservidor"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white'
                  }
                }}
              >
                <FontAwesomeIcon icon={faDiscord} size="lg" />
              </Box>

              <Box 
                component="a"
                href="https://instagram.com/tuusuario"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white'
                  }
                }}
              >
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </Box>

              <Box 
                component="a"
                href="https://wa.me/tunumero"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white'
                  }
                }}
              >
                <FontAwesomeIcon icon={faWhatsapp} size="lg" />
              </Box>
            </Box>
          </Box>
          <Box 
            sx={{ 
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxHeight: '600px',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,1) 100%)',
                filter: 'blur(15px)',
                zIndex: 1,
                pointerEvents: 'none'
              }
            }}
          >
            <img
              src={skins[currentSkinIndex]}
              alt="Fortnite Skin"
              style={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '600px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))',
                position: 'relative',
                zIndex: 0,
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.5s ease-in-out'
              }}
            />
          </Box>
        </Box>
      </Container>
      <Box sx={{ py: 8, bgcolor: 'rgba(0,0,0,0.9)' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '32px', sm: '40px' },
              fontWeight: 600,
              color: 'white',
              textAlign: 'center',
              mb: 6
            }}
          >
            Daily Shop
          </Typography>
          <DailyShop />
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
