import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Container, Typography, Card, CardMedia } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const AUTOPLAY_DELAY = 4000; // 4 segundos entre cada transición

const DailyShop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  // Autoplay
  useEffect(() => {
    let interval;
    if (items.length > 0) {
      interval = setInterval(nextSlide, AUTOPLAY_DELAY);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [nextSlide, items.length]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('https://fortniteapi.io/v2/shop', {
          headers: {
            'Authorization': 'eafc4329-54aeed01-a90cd52b-f749534c'
          }
        });
        
        // Filtramos solo las skins individuales
        const skins = response.data.shop
          .filter(item => {
            const itemType = item.granted?.[0]?.type?.id?.toLowerCase() || '';
            const itemName = item.displayName?.toLowerCase() || '';
            return (itemType.includes('outfit') || 
                    itemType.includes('character') ||
                    itemType.includes('cid_')) &&
                    !itemName.includes('bundle') &&
                    item.granted?.length === 1;
          })
          .slice(0, 8); // Limitamos a 8 skins
        
        setItems(skins);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const getBestImage = (item) => {
    if (item.displayAssets && item.displayAssets[0]) {
      return item.displayAssets[0].full_background || 
             item.displayAssets[0].background || 
             item.displayAssets[0].url;
    }

    if (item.granted?.[0]?.images) {
      return item.granted[0].images.full_background ||
             item.granted[0].images.icon ||
             item.granted[0].images.featured ||
             item.granted[0].images.background;
    }

    return item.images?.icon || 'https://media.fortniteapi.io/images/misc/placeholder.png';
  };

  // Función para obtener los índices de las skins visibles
  const getVisibleIndexes = () => {
    const indexes = [];
    for (let i = -2; i <= 2; i++) {
      let index = currentIndex + i;
      if (index < 0) index = items.length + index;
      if (index >= items.length) index = index - items.length;
      indexes.push(index);
    }
    return indexes;
  };

  return (
    <Box sx={{ 
      bgcolor: '#000000',
      py: 10,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h2" 
            sx={{ 
              color: 'white',
              mb: 6,
              fontWeight: 900,
              textAlign: 'center',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: 'linear-gradient(45deg, #00ff00 30%, #4CAF50 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Featured Skins
          </Typography>

          {!loading && items.length > 0 && (
            <Box sx={{ 
              height: '600px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1000px'
            }}>
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformStyle: 'preserve-3d'
              }}>
                <AnimatePresence mode="popLayout">
                  {getVisibleIndexes().map((index, i) => (
                    <motion.div
                      key={`${items[index].mainId}-${i}`}
                      initial={{ 
                        scale: 0.6,
                        opacity: 0,
                        rotateY: (i - 2) * 15,
                        z: i === 2 ? 0 : -200
                      }}
                      animate={{ 
                        scale: i === 2 ? 1 : 0.7,
                        opacity: i === 2 ? 1 : 0.5,
                        x: (i - 2) * 300,
                        rotateY: (i - 2) * 15,
                        z: i === 2 ? 0 : -200
                      }}
                      exit={{ 
                        scale: 0.6,
                        opacity: 0,
                        rotateY: (i - 2) * 15,
                        z: -200
                      }}
                      transition={{ 
                        duration: 0.8,
                        ease: [0.43, 0.13, 0.23, 0.96]
                      }}
                      style={{
                        position: 'absolute',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <Card sx={{ 
                        bgcolor: 'transparent',
                        boxShadow: i === 2 ? '0 0 30px rgba(76, 175, 80, 0.3)' : 'none',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        width: i === 2 ? '400px' : '300px',
                        height: i === 2 ? '600px' : '450px',
                        transition: 'all 0.5s',
                        position: 'relative',
                        filter: i !== 2 ? 'blur(5px) brightness(0.5)' : 'none',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: '20px',
                          border: i === 2 ? '2px solid rgba(76, 175, 80, 0.5)' : 'none',
                          zIndex: 1
                        }
                      }}>
                        <CardMedia
                          component="img"
                          image={getBestImage(items[index])}
                          alt={items[index].displayName}
                          sx={{ 
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          width: '100%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                          p: 3,
                          textAlign: 'center',
                          opacity: i === 2 ? 1 : 0
                        }}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              color: 'white',
                              mb: 1,
                              fontSize: i === 2 ? '1.8rem' : '1.4rem',
                              fontWeight: 700,
                              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                            }}
                          >
                            {items[index].displayName}
                          </Typography>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              background: 'linear-gradient(45deg, #00ff00 30%, #4CAF50 90%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontWeight: 900,
                              fontSize: i === 2 ? '1.5rem' : '1.2rem',
                              textShadow: 'none'
                            }}
                          >
                            {items[index].price.finalPrice} V-Bucks
                          </Typography>
                        </Box>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            </Box>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default DailyShop;
