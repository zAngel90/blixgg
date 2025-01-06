import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { motion } from 'framer-motion';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';

const Bot = () => {
  const features = [
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: '#00ff00' }} />,
      title: 'Smart Automation',
      description: 'Advanced AI-powered automation for your gaming experience.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#00ff00' }} />,
      title: 'High Performance',
      description: 'Lightning-fast response times and optimal resource usage.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#00ff00' }} />,
      title: 'Secure & Safe',
      description: 'Built with security in mind, following best practices and guidelines.'
    }
  ];

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
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <SmartToyIcon sx={{ fontSize: 60, color: '#00ff00', mb: 2 }} />
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 900,
                mb: 2,
                background: 'linear-gradient(45deg, #00ff00 30%, #4CAF50 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Gaming Bot
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                mb: 4,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Enhance your gaming experience with our advanced AI-powered bot. 
              Designed for optimal performance and security.
            </Typography>
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
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              Get Started
            </Button>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <Card sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    height: '100%',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 8px 16px rgba(76, 175, 80, 0.2)'
                    }
                  }}>
                    <CardContent sx={{ 
                      textAlign: 'center',
                      p: 4
                    }}>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 2,
                          fontWeight: 700,
                          color: '#00ff00'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Bot;
