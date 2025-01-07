import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText 
} from '@mui/material';

const FortniteMenu = ({ isOpen, onOptionSelect }) => {
  const handleOptionClick = (option, event) => {
    event.stopPropagation();
    onOptionSelect(option);
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
        backdropFilter: 'blur(10px)',
      }}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={(e) => handleOptionClick('daily-shop', e)}
            sx={{
              color: 'rgba(255,255,255,0.65)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white'
              },
            }}
          >
            <ListItemText 
              primary="Daily Shop" 
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

export default FortniteMenu;