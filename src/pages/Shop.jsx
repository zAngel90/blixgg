import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Skeleton,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';

const Shop = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('https://fortniteapi.io/v2/shop', {
          headers: {
            'Authorization': 'eafc4329-54aeed01-a90cd52b-f749534c'
          },
          params: {
            lang: 'en'
          }
        });
        
        const shopItems = response.data.shop || [];
        setItems(shopItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filterItemsByType = (type) => {
    return items.filter(item => {
      // Verificar si es un bundle
      if (type === 'bundles') {
        return item.granted && 
               item.granted.length > 1 && 
               item.displayName.toLowerCase().includes('bundle');
      }

      // Para otros tipos, verificar el tipo del primer item concedido
      const itemType = item.granted[0]?.type?.id?.toLowerCase() || '';
      const itemName = item.displayName?.toLowerCase() || '';
      const mainType = item.mainType?.toLowerCase() || '';
      
      switch(type) {
        case 'skins':
          // Excluir explícitamente tracks y bundles
          if (mainType.includes('sparks_song') || 
              mainType.includes('music') || 
              itemName.includes('bundle') ||
              itemType.includes('music') ||
              itemType.includes('track')) {
            return false;
          }
          // Solo incluir skins individuales
          return (itemType.includes('outfit') || 
                  itemType.includes('character') ||
                  itemType.includes('cid_')) &&
                  item.granted.length === 1;
        case 'emotes':
          return itemType.includes('emote') || 
                 itemType.includes('dance') || 
                 itemName.includes('emote') || 
                 itemName.includes('dance');
        case 'backpacks':
          return itemType.includes('back') || 
                 itemName.includes('back bling') ||
                 item.granted[0]?.name?.toLowerCase().includes('back bling');
        case 'tracks':
          return itemType.includes('music') || 
                 itemType.includes('track') ||
                 mainType === 'sparks_song';
        default:
          return true;
      }
    });
  };

  const getBestImage = (item) => {
    console.log('Item being processed:', item); // Para debug

    // Para bundles, intentar obtener la imagen de displayAssets primero
    if (item.displayName?.toLowerCase().includes('bundle')) {
      // Intentar obtener la imagen del displayAsset primero
      if (item.displayAssets?.[0]) {
        const displayAsset = item.displayAssets[0];
        const displayImage = displayAsset.full_background || 
                           displayAsset.background || 
                           displayAsset.url;
        if (displayImage) return displayImage;
      }

      // Si no hay displayAsset, intentar con las imágenes del bundle
      if (item.images) {
        const bundleImage = item.images.full_background ||
                          item.images.featured ||
                          item.images.icon ||
                          item.images.background;
        if (bundleImage) return bundleImage;
      }

      // Si aún no hay imagen, intentar con el primer item granted
      if (item.granted?.[0]?.images) {
        const grantedImage = item.granted[0].images.full_background ||
                           item.granted[0].images.featured ||
                           item.granted[0].images.icon ||
                           item.granted[0].images.background;
        if (grantedImage) return grantedImage;
      }

      // Si es el bundle específico de Liaqn y no se encontró imagen
      if (item.displayName === "Liaqn's Locker Bundle") {
        return 'https://media.fortniteapi.io/images/shop/Liaqn/featured.png';
      }
    }

    // Para otros items no bundle
    if (item.displayAssets && item.displayAssets[0]) {
      const displayAsset = item.displayAssets[0];
      const displayImage = displayAsset.full_background || 
                         displayAsset.background || 
                         displayAsset.url;
      if (displayImage) return displayImage;
    }

    // Intentar con las imágenes del primer item granted
    if (item.granted?.[0]?.images) {
      const grantedImage = item.granted[0].images.full_background ||
                         item.granted[0].images.featured ||
                         item.granted[0].images.icon ||
                         item.granted[0].images.background;
      if (grantedImage) return grantedImage;
    }

    // Intentar con las imágenes directas del item
    if (item.images) {
      const itemImage = item.images.full_background ||
                      item.images.featured ||
                      item.images.icon ||
                      item.images.background;
      if (itemImage) return itemImage;
    }

    // Si todo lo demás falla, usar la imagen por defecto
    return 'https://media.fortniteapi.io/images/misc/placeholder.png';
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const sections = [
    { label: 'Bundles', value: 'bundles' },
    { label: 'Skins', value: 'skins' },
    { label: 'Emotes', value: 'emotes' },
    { label: 'Back Blings', value: 'backpacks' },
    { label: 'Tracks', value: 'tracks' }
  ];

  const currentItems = filterItemsByType(sections[currentTab].value);

  return (
    <Box sx={{ 
      bgcolor: '#000000',
      minHeight: '100vh',
      pt: 12,
      pb: 10
    }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h2" 
            sx={{ 
              color: 'white',
              mb: 4,
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Daily Shop
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': {
                    color: 'white'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white'
                }
              }}
            >
              {sections.map((section, index) => (
                <Tab key={index} label={section.label} />
              ))}
            </Tabs>
          </Box>

          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(8)).map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{ 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}>
                      <Skeleton 
                        variant="rectangular" 
                        height={200}
                        sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                      />
                      <CardContent>
                        <Skeleton 
                          variant="text"
                          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                        />
                        <Skeleton 
                          variant="text"
                          width="60%"
                          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : currentItems.map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.mainId}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{ height: '100%' }}
                    >
                      <Card sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}>
                        <CardMedia
                          component="img"
                          height="250"
                          image={getBestImage(item)}
                          alt={item.displayName}
                          sx={{ 
                            objectFit: 'contain', 
                            p: 2,
                            backgroundColor: 'rgba(0,0,0,0.5)'
                          }}
                        />
                        <CardContent sx={{ 
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          height: '200px',
                          gap: 2
                        }}>
                          <Typography 
                            gutterBottom 
                            variant="h6" 
                            component="div"
                            sx={{ 
                              color: 'white',
                              height: '60px',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {item.displayName}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#ffb74d',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <img 
                              src="https://fortnite-api.com/images/vbuck.png" 
                              alt="V-Bucks" 
                              style={{ height: '20px' }}
                            />
                            {item.price.finalPrice}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              height: '60px',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {item.granted[0]?.description || item.displayDescription || ''}
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

export default Shop;
