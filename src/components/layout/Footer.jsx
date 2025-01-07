import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: '#000',
        color: 'white',
        py: 6,
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo y descripción */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <img 
                src="https://imgur.com/PHbtv9x.png" 
                alt="Logo" 
                style={{ 
                  height: '32px',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                maxWidth: '300px',
                mb: 3
              }}
            >
              Tu destino definitivo para V-Bucks y Robux. Obtén las mejores ofertas en moneda virtual para Fortnite y Roblox.
            </Typography>
          </Grid>

          {/* Enlaces rápidos */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Servicios
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                href="#" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textDecoration: 'none',
                  '&:hover': { color: 'white' }
                }}
              >
                Fortnite Shop
              </Link>
              <Link 
                href="#" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textDecoration: 'none',
                  '&:hover': { color: 'white' }
                }}
              >
                Roblox Shop
              </Link>
              <Link 
                href="#" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textDecoration: 'none',
                  '&:hover': { color: 'white' }
                }}
              >
                Bots
              </Link>
            </Box>
          </Grid>

          {/* Soporte */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Soporte
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                href="#" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textDecoration: 'none',
                  '&:hover': { color: 'white' }
                }}
              >
                FAQ
              </Link>
              <Link 
                href="#" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textDecoration: 'none',
                  '&:hover': { color: 'white' }
                }}
              >
                Contacto
              </Link>
              <Link 
                href="#" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textDecoration: 'none',
                  '&:hover': { color: 'white' }
                }}
              >
                Términos
              </Link>
            </Box>
          </Grid>

          {/* Contacto y redes sociales */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Síguenos
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Link
                href="https://discord.gg/tuservidor"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <FontAwesomeIcon icon={faDiscord} size="lg" />
              </Link>
              <Link
                href="https://instagram.com/tuusuario"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </Link>
              <Link
                href="https://wa.me/tunumero"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'white' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <FontAwesomeIcon icon={faWhatsapp} size="lg" />
              </Link>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Email: contacto@blixgg.com
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Horario: 24/7
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            © 2024 BLIX GG. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link 
              href="#" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '14px',
                '&:hover': { color: 'white' }
              }}
            >
              Privacidad
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '14px',
                '&:hover': { color: 'white' }
              }}
            >
              Términos
            </Link>
            <Link 
              href="#" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '14px',
                '&:hover': { color: 'white' }
              }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 