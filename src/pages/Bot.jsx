import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SendIcon from '@mui/icons-material/Send';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Bot = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [botStatuses, setBotStatuses] = useState({
    bot1: { status: 'offline', lastUpdate: null, displayName: null },
    bot2: { status: 'offline', lastUpdate: null, displayName: null }
  });

  // Función para validar username
  const validateUsername = async () => {
    if (!username) {
      setError('Por favor ingresa un nombre de usuario');
      return false;
    }

    setValidating(true);
    setError(null);

    try {
      // Validar en ambos bots
      const response1 = await fetch('http://localhost:3003/api/validate-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      const response2 = await fetch('http://localhost:3001/api/validate-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      if (!response1.ok || !response2.ok) {
        throw new Error('Usuario no encontrado');
      }

      return true;
    } catch (err) {
      setError('Usuario no encontrado o inválido');
      return false;
    } finally {
      setValidating(false);
    }
  };

  // Función para enviar solicitud de amistad
  const handleSendFriendRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      // Primero validar el username
      const isValid = await validateUsername();
      if (!isValid) {
        return;
      }

      // Enviar solicitud al Bot 1
      const response1 = await fetch('http://localhost:3003/api/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      // Enviar solicitud al Bot 2
      const response2 = await fetch('http://localhost:3001/api/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Verificar si alguna solicitud falló
      if (!response1.ok) {
        throw new Error(data1.error || 'Error con BOT1: No se pudo enviar la solicitud');
      }
      if (!response2.ok) {
        throw new Error(data2.error || 'Error con BOT2: No se pudo enviar la solicitud');
      }

      // Si ambas solicitudes fueron exitosas
      if (data1.success && data2.success) {
        setSuccess(true);
        setUsername('');
      } else {
        // Si alguna solicitud no fue exitosa pero respondió con ok
        const errorMessage = [];
        if (!data1.success) errorMessage.push(`BOT1: ${data1.message || 'Error desconocido'}`);
        if (!data2.success) errorMessage.push(`BOT2: ${data2.message || 'Error desconocido'}`);
        throw new Error(errorMessage.join(' | '));
      }

    } catch (err) {
      console.error('Error al enviar solicitudes:', err);
      setError(err.message || 'Error al enviar las solicitudes de amistad');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para verificar el estado de los bots
  useEffect(() => {
    const checkBotStatus = async () => {
      try {
        // Verificar Bot 1
        const response1 = await fetch('http://localhost:3003/api/bot-status');
        const status1 = await response1.json();
        
        // Verificar Bot 2
        const response2 = await fetch('http://localhost:3001/api/bot-status');
        const status2 = await response2.json();

        setBotStatuses({
          bot1: { 
            status: status1.isAuthenticated ? 'online' : 'offline',
            lastUpdate: new Date().toLocaleString(),
            displayName: status1.displayName
          },
          bot2: {
            status: status2.isAuthenticated ? 'online' : 'offline',
            lastUpdate: new Date().toLocaleString(),
            displayName: status2.displayName
          }
        });
      } catch (err) {
        console.error('Error al verificar estado de los bots:', err);
        // Actualizar el estado a desconectado en caso de error
        setBotStatuses(prev => ({
          bot1: { 
            ...prev.bot1,
            status: 'offline',
            lastUpdate: new Date().toLocaleString()
          },
          bot2: {
            ...prev.bot2,
            status: 'offline',
            lastUpdate: new Date().toLocaleString()
          }
        }));
      }
    };

    // Verificar estado inicial
    checkBotStatus();

    // Verificar estado cada 30 segundos
    const interval = setInterval(checkBotStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ 
      bgcolor: '#000000',
      minHeight: '100vh',
      pt: 12,
      pb: 10
    }}>
      <Container maxWidth="lg">
        {/* Título */}
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
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Panel de Bots
          </Typography>

          {/* Estado de los Bots */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {Object.entries(botStatuses).map(([botName, status], index) => (
              <Grid item xs={12} md={6} key={botName}>
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
                    <CardContent sx={{ p: 4 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 2,
                          fontWeight: 700,
                          color: '#00ff00',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        {status.status === 'online' ? (
                          <CheckCircleIcon sx={{ color: '#00ff00' }} />
                        ) : (
                          <ErrorIcon sx={{ color: '#ff0000' }} />
                        )}
                        {botName.toUpperCase()}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        Estado: {status.status === 'online' ? 'En línea' : 'Desconectado'}
                      </Typography>
                      {status.displayName && (
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                          Nombre: {status.displayName}
                        </Typography>
                      )}
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Última actualización: {status.lastUpdate}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Formulario de Solicitud de Amistad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card sx={{ 
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              p: 4
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4,
                  fontWeight: 700,
                  color: '#00ff00',
                  textAlign: 'center'
                }}
              >
                Enviar Solicitud de Amistad
              </Typography>
              
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Nombre de usuario de Fortnite"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading || validating}
                  sx={{
                    maxWidth: '400px',
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#00ff00',
                      },
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => validateUsername()}
                    disabled={loading || validating || !username}
                    startIcon={validating ? <CircularProgress size={20} /> : <PersonAddIcon />}
                    sx={{
                      bgcolor: '#2196f3',
                      color: 'white',
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#1976d2'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(33,150,243,0.3)'
                      }
                    }}
                  >
                    {validating ? 'Validando...' : 'Validar'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSendFriendRequest}
                    disabled={loading || validating || !username}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{
                      bgcolor: '#00ff00',
                      color: 'black',
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#00cc00'
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(0,255,0,0.3)'
                      }
                    }}
                  >
                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
                  </Button>
                </Box>
              </Box>

              <Typography 
                sx={{ 
                  color: 'rgba(255,255,255,0.5)',
                  mt: 3,
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}
              >
                Primero valida el nombre de usuario antes de enviar la solicitud
              </Typography>
            </Card>
          </motion.div>
        </motion.div>

        {/* Snackbar para mensajes */}
        <Snackbar 
          open={error !== null} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>

        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(false)}
        >
          <Alert 
            onClose={() => setSuccess(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Solicitud de amistad enviada con éxito
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Bot;
