import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DailyShop from '../components/DailyShop';

const LogoSlider = () => {
  return (
    <Box sx={{ 
      overflow: 'hidden',
      width: '100%',
      height: '50px',
    }}>
      <motion.div
        style={{
          display: 'flex',
          gap: '100px',
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}
        animate={{
          x: [-1920, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {[...Array(20)].map((_, i) => (
          <img
            key={i}
            src="https://imgur.com/6urzv1Y.png"
            alt="Logo"
            style={{
              height: '40px',
              filter: 'brightness(0) invert(1)',
              opacity: 0.6
            }}
          />
        ))}
      </motion.div>
    </Box>
  );
};

const Home = () => {
  return (
    <Box sx={{ 
      bgcolor: '#000000', 
      color: 'white',
      minHeight: '100vh',
      pt: 15
    }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
              fontWeight: 'bold',
              mb: 2,
              lineHeight: 1.1
            }}
          >
            The web builder<br />
            for stunning sites.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              mb: 4,
              maxWidth: '600px'
            }}
          >
            Design and publish modern sites at any scale with Framer's web builder.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 15 }}>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                background: 'linear-gradient(45deg, #00ff00 30%, #4CAF50 90%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4CAF50 30%, #00ff00 90%)',
                  boxShadow: '0 8px 16px rgba(76, 175, 80, 0.3)'
                },
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              Start for free
            </Button>
            <Button 
              variant="outlined"
              size="large"
              startIcon={<PlayArrowIcon />}
              sx={{ 
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white'
                },
                borderRadius: '50px',
                px: 4
              }}
            >
              Watch video
            </Button>
          </Box>

          <LogoSlider />
        </motion.div>
      </Container>
      <DailyShop />
    </Box>
  );
};

export default Home;
