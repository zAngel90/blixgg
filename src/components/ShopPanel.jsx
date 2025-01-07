import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Chip,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ShopPanel = ({ isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rarity, setRarity] = useState('all');
  const [type, setType] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShopItems = async () => {
      if (!isOpen) return;
      
      console.log('Fetching shop items...');
      setLoading(true);
      try {
        const response = await fetch('https://fortniteapi.io/v2/shop?lang=en', {
          headers: {
            'Authorization': 'eafc4329-54aeed01-a90cd52b-f749534c'
          }
        });
        const data = await response.json();
        
        if (data.result) {
          const formattedItems = data.shop.map((item, index) => {
            const mainItem = item.granted[0] || {};
            const itemType = item.mainType || mainItem.type?.id || 'outfit';
            
            // Priorizar imágenes transparentes
            const getTransparentImage = () => {
              if (mainItem.images?.icon) return mainItem.images.icon;
              if (mainItem.images?.transparent) return mainItem.images.transparent;
              if (item.displayAssets?.[0]?.transparent) return item.displayAssets[0].transparent;
              return item.displayAssets?.[0]?.full_background || 
                     mainItem.images?.featured || 
                     item.displayAssets?.[0]?.url;
            };

            return {
              id: `${item.mainId}_${index}`, // Asegurar keys únicas
              name: item.displayName,
              description: item.displayDescription,
              price: item.price.regularPrice,
              rarity: item.rarity?.id?.toLowerCase() || mainItem.rarity?.id?.toLowerCase() || 'common',
              type: itemType,
              image: getTransparentImage(),
              sortOrder: getSortOrder(itemType)
            };
          })
          .filter(item => item.image)
          .sort((a, b) => a.sortOrder - b.sortOrder);

          console.log('Shop items loaded:', formattedItems.length);
          setItems(formattedItems);
        }
      } catch (error) {
        console.error('Error fetching shop items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchShopItems();
    }
  }, [isOpen]);

  const getSortOrder = (type) => {
    switch(type.toLowerCase()) {
      case 'bundle': return 0;
      case 'outfit': return 1;
      case 'backpack': return 2;
      case 'pickaxe': return 3;
      case 'glider': return 4;
      case 'wrap': return 5;
      case 'emote': return 6;
      case 'music': 
      case 'musicpack':
      case 'sparks_song':
        return 999; // Asegura que la música siempre aparezca al final
      default: return 7;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarity === 'all' || item.rarity === rarity;
    const matchesType = type === 'all' || 
                       (type === 'music' ? 
                         ['music', 'musicpack', 'sparks_song'].includes(item.type.toLowerCase()) : 
                         item.type.toLowerCase() === type);
    return matchesSearch && matchesRarity && matchesType;
  });

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return '#b1b1b1';
      case 'uncommon': return '#60aa3a';
      case 'rare': return '#49acf2';
      case 'epic': return '#b15be2';
      case 'legendary': return '#ea8d23';
      default: return '#b1b1b1';
    }
  };

  console.log('Rendering ShopPanel, isOpen:', isOpen);
  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '8px',
        right: '50%',
        transform: 'translateX(25%)',
        width: '90vw',
        maxWidth: '1400px',
        bgcolor: '#000000',
        overflow: 'hidden',
        height: isOpen ? '80vh' : 0,
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
        zIndex: 1000
      }}
    >
      <Box 
        sx={{ 
          height: '100%',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255,255,255,0.3)',
            },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Filtros y Búsqueda */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3,
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: '#000000',
              py: 2,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '13px',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.4)',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>Rarity</InputLabel>
              <Select
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '13px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.4)',
                  },
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="common">Common</MenuItem>
                <MenuItem value="uncommon">Uncommon</MenuItem>
                <MenuItem value="rare">Rare</MenuItem>
                <MenuItem value="epic">Epic</MenuItem>
                <MenuItem value="legendary">Legendary</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>Type</InputLabel>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '13px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.4)',
                  },
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="bundle">Bundles</MenuItem>
                <MenuItem value="outfit">Outfits</MenuItem>
                <MenuItem value="backpack">Back Blings</MenuItem>
                <MenuItem value="pickaxe">Pickaxes</MenuItem>
                <MenuItem value="glider">Gliders</MenuItem>
                <MenuItem value="wrap">Wraps</MenuItem>
                <MenuItem value="emote">Emotes</MenuItem>
                <MenuItem value="music">Music</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Grid de Items */}
          <Grid 
            container 
            spacing={2} 
            sx={{ 
              position: 'relative',
              zIndex: 1
            }}
          >
            {loading ? (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: 'white' }} />
              </Box>
            ) : (
              filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.id}>
                  <Card sx={{ 
                    bgcolor: 'rgba(255,255,255,0.03)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      bgcolor: 'rgba(255,255,255,0.06)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    },
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image}
                      alt={item.name}
                      sx={{ 
                        objectFit: 'contain',
                        p: 2,
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 1,
                        gap: 1
                      }}>
                        <Typography 
                          sx={{ 
                            color: 'white', 
                            fontSize: '13px', 
                            fontWeight: 500,
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Chip 
                          label={`${item.price} V-Bucks`}
                          size="small"
                          sx={{ 
                            bgcolor: getRarityColor(item.rarity),
                            color: 'white',
                            fontSize: '11px',
                            height: '20px',
                            fontWeight: 600,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      </Box>
                      <Typography 
                        sx={{ 
                          color: 'rgba(255,255,255,0.5)', 
                          fontSize: '12px',
                          lineHeight: 1.4
                        }}
                      >
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ShopPanel;