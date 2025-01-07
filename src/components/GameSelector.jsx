import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const GameSelector = ({ isOpen, onGameSelect }) => {
  const handleGameClick = (game, event) => {
    event.stopPropagation();
    onGameSelect(game, event);
  };

  if (!isOpen) return null;

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: 'absolute',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: '#000000',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
        width: '200px',
        zIndex: 1000,
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={(e) => handleGameClick('fortnite', e)}
            sx={{
              color: 'rgba(255,255,255,0.65)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white'
              },
            }}
          >
            <ListItemText 
              primary="Fortnite" 
              primaryTypographyProps={{
                sx: {
                  fontSize: '13px',
                  fontWeight: 400
                }
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={(e) => handleGameClick('roblox', e)}
            sx={{
              color: 'rgba(255,255,255,0.65)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white'
              },
            }}
          >
            <ListItemText 
              primary="Roblox" 
              primaryTypographyProps={{
                sx: {
                  fontSize: '13px',
                  fontWeight: 400
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default GameSelector;