const express = require('express');
const cors = require('cors');
const https = require('https');
const dns = require('dns').promises;
const tls = require('tls');
const qs = require('qs');
const crypto = require('crypto');
const axios = require('axios'); // Importar axios
const HttpsProxyAgent = require('https-proxy-agent');
const jwt = require('jsonwebtoken'); // Importar jwt
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://api-sbx.dlocalgo.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Servir archivos estáticos
app.use(express.static(__dirname));

// Estado del bot
let botStatus = {
    deviceId: null,
    accessToken: null,
    accountId: null,
    displayName: null,
    expiresAt: null,
    friendToken: null, // Token para solicitudes de amistad
    isAuthenticated: false,
    lastError: null,
    refreshToken: null,
    lastUpdate: null
};

// Variables globales
const pendingRequests = new Map();

// Función para generar ID único para solicitudes pendientes
function generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para obtener token de acceso
async function getAccessToken(authCode) {
    try {
        console.log('🔑 Obteniendo token con código:', authCode);
        
        // Generar device ID si no existe
        if (!botStatus.deviceId) {
            botStatus.deviceId = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
                return (Math.random() * 16 | 0).toString(16);
            });
        }
        
        const options = {
            hostname: 'account-public-service-prod.ol.epicgames.com',
            port: 443,
            path: '/account/api/oauth/token',
            method: 'POST',
            headers: {
                'Authorization': 'Basic M2Y2OWU1NmM3NjQ5NDkyYzhjYzI5ZjFhZjA4YThhMTI6YjUxZWU5Y2IxMjIzNGY1MGE2OWVmYTY3ZWY1MzgxMmU=',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-27526713 Android/11',
                'X-Epic-Device-ID': botStatus.deviceId
            },
            ...defaultTlsOptions
        };

        const body = qs.stringify({
            grant_type: 'authorization_code',
            code: authCode,
            token_type: 'eg1'
        });

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('Respuesta completa del token:', data);

                    if (!res.statusCode || res.statusCode >= 400) {
                        reject(new Error(`No se pudo obtener el token de acceso. Status: ${res.statusCode}. Response: ${data}`));
                        return;
                    }

                    try {
                        const tokenData = JSON.parse(data);
                        resolve(tokenData);
                    } catch (e) {
                        reject(new Error(`Error al parsear la respuesta del token: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                console.error('Error al obtener token:', error);
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Timeout al obtener token'));
            });

            req.write(body);
            req.end();
        });
    } catch (error) {
        console.error('Error al obtener token:', error);
        throw error;
    }
}

// Función para obtener información del usuario
async function getUserInfo(accessToken) {
    try {
        const options = {
            hostname: 'account-public-service-prod.ol.epicgames.com',
            port: 443,
            path: '/account/api/oauth/verify',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            ...defaultTlsOptions
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('Respuesta completa del usuario:', data);

                    if (!res.statusCode || res.statusCode >= 400) {
                        reject(new Error(`No se pudo obtener la información del usuario. Status: ${res.statusCode}. Response: ${data}`));
                        return;
                    }

                    try {
                        const userData = JSON.parse(data);
                        resolve(userData);
                    } catch (e) {
                        reject(new Error(`Error al parsear la respuesta del usuario: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                console.error('Error al obtener información del usuario:', error);
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Timeout al obtener información del usuario'));
            });

            req.end();
        });
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        throw error;
    }
}

// Función para validar el username antes de la solicitud de amistad
async function validateFriendUsername(username) {
    try {
        // Asegurarse de que el bot esté autenticado
        await ensureBotAuthenticated();
        
        // Obtener el ID de la cuenta del usuario
        console.log('🔍 Validando usuario:', username);
        const userData = await getAccountIdByUsername(username);
        if (!userData || !userData.id) {
            throw new Error('No se pudo encontrar el usuario');
        }
        return userData;
    } catch (error) {
        console.error('❌ Error al validar usuario:', error);
        throw error;
    }
}

// Endpoint para validar username
app.post('/api/validate-friend', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            throw new Error('Se requiere un nombre de usuario');
        }

        const result = await validateFriendUsername(username);
        res.json(result);

    } catch (error) {
        console.error('❌ Error al validar usuario:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para enviar solicitud de amistad
app.post('/api/friend-request', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere un nombre de usuario'
            });
        }

        // Asegurarnos que el bot esté autenticado
        if (!botStatus.isAuthenticated || !botStatus.accessToken) {
            return res.status(401).json({
                success: false,
                error: 'Bot no autenticado'
            });
        }

        // Usar el token del bot directamente
        try {
            const userData = await validateFriendUsername(username);
            const result = await sendFriendRequestToEpic(username, botStatus.accessToken);
            return res.json(result);
        } catch (error) {
            console.error('❌ Error al enviar solicitud:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    } catch (error) {
        console.error('❌ Error al procesar solicitud:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Función para enviar solicitud de amistad
async function sendFriendRequestToEpic(username, accessToken) {
    try {
        console.log('📨 Enviando solicitud de amistad a:', username);
        
        // Validar el usuario y obtener su ID
        const userData = await validateFriendUsername(username);
        // Limpiar el ID de cualquier prefijo
        const cleanId = userData.id.replace(/^(epic|psn|xbl|nintendo)_/, '');
        
        // Obtener el ID de la cuenta que envía la solicitud
        const accountId = botStatus.accountId;
        
        console.log('🔄 Enviando solicitud desde:', accountId, 'para:', cleanId);
        
        const response = await axios({
            method: 'POST',
            url: `https://friends-public-service-prod.ol.epicgames.com/friends/api/v1/${accountId}/friends/${cleanId}`,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-27526713 Android/11'
            },
            validateStatus: function (status) {
                return status === 204 || status >= 200 && status < 300 || status === 409;
            }
        });

        // Si la solicitud ya fue enviada, lo consideramos como éxito
        if (response.status === 409 && response.data?.errorCode === 'errors.com.epicgames.friends.friend_request_already_sent') {
            return { 
                success: true, 
                message: `Ya enviaste una solicitud de amistad a ${username}. Espera a que la acepte.`,
                alreadySent: true
            };
        }

        if (response.status === 204 || response.status === 200) {
            return { 
                success: true, 
                message: `Solicitud de amistad enviada correctamente a ${username}` 
            };
        }

        throw new Error(response.data?.errorMessage || 'Error al enviar la solicitud');
    } catch (error) {
        console.error('❌ Error al enviar solicitud:', error.response?.data || error.message);
        throw new Error(error.response?.data?.errorMessage || 'Error al enviar la solicitud de amistad');
    }
}

// Endpoint para recibir token de amigos
app.post('/api/friend-token', async (req, res) => {
    try {
        const { friendToken } = req.body;
        
        if (!friendToken) {
            return res.status(400).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        try {
            // Si es un token hexadecimal, convertirlo a OAuth
            if (/^[0-9a-fA-F]{32}$/.test(friendToken)) {
                const oauthToken = await exchangeHexTokenForOAuth(friendToken);
                botStatus.friendToken = oauthToken.access_token;
                console.log('✅ Token OAuth guardado:', oauthToken.access_token.substring(0, 10) + '...');
            } else {
                botStatus.friendToken = friendToken;
            }

            return res.json({
                success: true,
                message: 'Token guardado correctamente'
            });
        } catch (error) {
            console.error('❌ Error al procesar el token:', error);
            return res.status(400).json({
                success: false,
                message: 'Error al procesar el token. Asegúrate de que sea válido.'
            });
        }
    } catch (error) {
        console.error('❌ Error en /api/friend-token:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Endpoint para obtener el estado del bot
app.get('/api/bot-status', (req, res) => {
    // Permitir CORS para el frontend
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // El bot está listo solo si está autenticado y el token no ha expirado
    const isReady = botStatus.isAuthenticated && 
                   botStatus.accessToken && 
                   botStatus.expiresAt && 
                   Date.now() < botStatus.expiresAt;

    res.json({
        isReady: isReady,
        isAuthenticated: botStatus.isAuthenticated,
        displayName: botStatus.displayName,
        lastError: botStatus.lastError,
        hasFriendToken: !!botStatus.friendToken,
        expiresAt: botStatus.expiresAt
    });
});

// Función para verificar si el token del bot ha expirado
function isBotTokenExpired() {
    if (!botStatus.expiresAt) return true;
    return Date.now() >= botStatus.expiresAt;
}

// Función para refrescar el token del bot si es necesario
async function ensureBotAuthenticated() {
    if (!botStatus.isAuthenticated || isBotTokenExpired()) {
        console.log('🔄 Token del bot expirado o no presente, reautenticando...');
        botStatus.lastError = 'Token expirado o no presente';
        botStatus.isAuthenticated = false;
        throw new Error('Bot necesita reautenticación');
    }
    return botStatus.accessToken;
}

// Función para actualizar el estado del bot
function updateBotStatus(newStatus) {
    console.log('🔄 Actualizando estado del bot:', {
        ...newStatus,
        accessToken: newStatus.accessToken ? '***token***' : null
    });
    
    botStatus = {
        ...botStatus,
        ...newStatus,
        lastUpdate: Date.now()
    };
}

// Función para verificar y formatear el token
function formatAuthToken(token) {
    if (!token) return null;
    
    // Nunca modificar el token, devolverlo tal cual
    return token;
}

// Función para obtener accountId por displayName
async function getAccountIdByUsername(username) {
    try {
        console.log('🔍 Buscando ID para usuario:', username);
        
        const response = await axios({
            method: 'GET',
            url: `https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/${encodeURIComponent(username)}`,
            headers: {
                'Authorization': `Bearer ${botStatus.accessToken}`,
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-24757023 Android/11'
            }
        });

        console.log('✅ Respuesta de búsqueda:', response.data);

        if (response.data && response.data.id) {
            return response.data; // Devolvemos el objeto completo
        }

        throw new Error('No se encontró el ID del usuario');
    } catch (error) {
        console.error('❌ Error en getAccountIdByUsername:', error.response?.data || error.message);
        throw new Error(error.response?.data?.errorMessage || 'No se pudo encontrar el usuario');
    }
}

// Endpoint para autenticación del bot
app.post('/api/auth', async (req, res) => {
    try {
        // Primero intentar usar Device Auth existente
        try {
            console.log('🔄 Intentando usar Device Auth existente...');
            const deviceAuth = await setupDeviceAuth();
            
            if (deviceAuth) {
                console.log('🔑 Device Auth encontrado, intentando autenticar...');
                // Usar Device Auth para autenticación
                const response = await axios({
                    method: 'POST',
                    url: 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic M2Y2OWU1NmM3NjQ5NDkyYzhjYzI5ZjFhZjA4YThhMTI6YjUxZWU5Y2IxMjIzNGY1MGE2OWVmYTY3ZWY1MzgxMmU=',
                        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-27526713 Android/11'
                    },
                    data: qs.stringify({
                        grant_type: 'device_auth',
                        device_id: deviceAuth.deviceId,
                        account_id: deviceAuth.accountId,
                        secret: deviceAuth.secret
                    })
                });

                // Actualizar estado del bot con el nuevo token
                updateBotStatus({
                    accessToken: response.data.access_token,
                    accountId: deviceAuth.accountId,
                    deviceId: deviceAuth.deviceId,
                    isAuthenticated: true,
                    expiresAt: Date.now() + (response.data.expires_in * 1000)
                });

                console.log('✅ Autenticación exitosa usando Device Auth');
                return res.json({
                    success: true,
                    displayName: botStatus.displayName
                });
            }
        } catch (deviceAuthError) {
            console.log('❌ Error usando Device Auth:', deviceAuthError.message);
        }

        // Si Device Auth falla o no existe, usar autenticación normal
        const { code } = req.body;
        if (!code) {
            throw new Error('Código de autorización requerido');
        }

        // Primero autenticar normalmente
        const tokenData = await authenticateBot(code);
        console.log('✅ Token obtenido correctamente');
        
        // Actualizar tokens
        updateBotStatus({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: Date.now() + (tokenData.expires_in * 1000)
        });

        // Obtener información del usuario
        const userInfo = await getUserInfo(tokenData.access_token);
        
        // Actualizar información del bot
        updateBotStatus({
            accountId: userInfo.account_id,
            displayName: userInfo.display_name,
            isAuthenticated: true,
            lastError: null
        });

        // AHORA intentar crear Device Auth
        await setupDeviceAuth();

        res.json({
            success: true,
            displayName: userInfo.display_name
        });
    } catch (error) {
        console.error('❌ Error al autenticar bot:', error.message);
        updateBotStatus({
            isAuthenticated: false,
            lastError: error.message
        });
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para reiniciar el bot
app.post('/api/reset', async (req, res) => {
    try {
        updateBotStatus({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            accountId: null,
            displayName: null,
            lastError: null
        });
        
        console.log('🔄 Bot reiniciado correctamente');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error al reiniciar bot:', error);
        res.status(500).json({ error: error.message });
    }
});

// Función para intercambiar token hexadecimal por token OAuth
async function exchangeHexTokenForOAuth(hexToken) {
    try {
        console.log('🔄 Intercambiando token hexadecimal por token OAuth...');
        
        const options = {
            hostname: 'account-public-service-prod.ol.epicgames.com',
            port: 443,
            path: '/account/api/oauth/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic M2Y2OWU1NmM3NjQ5NDkyYzhjYzI5ZjFhZjA4YThhMTI6YjUxZWU5Y2IxMjIzNGY1MGE2OWVmYTY3ZWY1MzgxMmU=',
                'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-27526713 Android/11'
            },
            rejectUnauthorized: false,
            ALPNProtocols: ['http/1.1'],
            minVersion: 'TLSv1.2',
            maxVersion: 'TLSv1.2',
            ciphers: [
                'TLS_AES_128_GCM_SHA256',
                'TLS_AES_256_GCM_SHA384',
                'TLS_CHACHA20_POLY1305_SHA256',
                'ECDHE-ECDSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384'
            ].join(':')
        };

        const body = qs.stringify({
            grant_type: 'authorization_code',
            code: hexToken,
            token_type: 'eg1'
        });

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('Respuesta completa del token:', data);

                    if (!res.statusCode || res.statusCode >= 400) {
                        throw new Error(`No se pudo obtener el token OAuth. Status: ${res.statusCode}. Response: ${data}`);
                    }

                    try {
                        const tokenData = JSON.parse(data);
                        resolve(tokenData);
                    } catch (e) {
                        throw new Error(`Error al parsear la respuesta del token: ${data}`);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('❌ Error al intercambiar token:', error);
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Timeout al intercambiar token'));
            });

            req.write(body);
            req.end();
        });
    } catch (error) {
        console.error('❌ Error al intercambiar token:', error);
        throw new Error('No se pudo obtener el token OAuth. Por favor, obtén un nuevo token.');
    }
}

// Endpoint para obtener el catálogo
app.get('/api/shop-catalog', async (req, res) => {
    try {
        const catalog = await getCurrentCatalog();
        const formattedItems = [];

        // Procesar solo las secciones principales de la tienda
        const mainSections = ['BRSpecialFeatured', 'BRWeeklyStorefront', 'BRDailyStorefront'];
        
        for (const storefront of catalog.storefronts) {
            // Solo procesar las secciones principales
            if (mainSections.includes(storefront.name)) {
                for (const entry of storefront.catalogEntries) {
                    // Solo incluir items que se pueden regalar
                    if (entry.giftInfo && entry.giftInfo.bIsEnabled) {
                        const price = entry.prices?.[0] || {};
                        formattedItems.push({
                            id: entry.offerId,
                            name: entry.devName?.split('1 x ')[1]?.split(' for ')[0] || entry.devName,
                            price: price.finalPrice || price.regularPrice || price.basePrice || 0,
                            currencyType: price.currencyType || "MtxCurrency",
                            rarity: entry.meta?.rarity || 'common',
                            images: {
                                icon: entry.meta?.NewDisplayAssetPath || '',
                                featured: entry.meta?.NewDisplayAssetPath || ''
                            },
                            section: storefront.name,
                            giftable: true
                        });
                    }
                }
            }
        }

        res.json({
            success: true,
            data: {
                featured: formattedItems
            }
        });
    } catch (error) {
        console.error('Error obteniendo catálogo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener el catálogo'
        });
    }
});

// Endpoint para obtener el catálogo actual sin formato
app.get('/api/raw-catalog', async (req, res) => {
    try {
        const catalog = await getCurrentCatalog();
        
        // Verificar que el catálogo tenga el formato correcto
        if (!catalog || !catalog.storefronts || !Array.isArray(catalog.storefronts)) {
            console.error('Formato de catálogo inválido:', catalog);
            return res.status(500).json({ 
                error: 'Formato de catálogo inválido',
                catalog 
            });
        }

        // Verificar que cada storefront tenga catalogEntries
        const validStorefronts = catalog.storefronts.filter(storefront => 
            storefront && storefront.catalogEntries && Array.isArray(storefront.catalogEntries)
        );

        if (validStorefronts.length === 0) {
            console.error('No se encontraron storefronts válidos en el catálogo');
            return res.status(500).json({ 
                error: 'No se encontraron items en el catálogo',
                catalog 
            });
        }

        console.log('Enviando catálogo con', {
            storefrontsCount: validStorefronts.length,
            totalItems: validStorefronts.reduce((acc, sf) => acc + sf.catalogEntries.length, 0)
        });

        res.json({
            storefronts: validStorefronts
        });
    } catch (error) {
        console.error('Error al obtener el catálogo:', error);
        res.status(500).json({ 
            error: 'Error al obtener el catálogo',
            message: error.message 
        });
    }
});

// Función para extraer precio del devName
function extractPriceFromDevName(devName) {
    const match = devName.match(/for (\d+) (\w+)/);
    if (match) {
        return {
            basePrice: parseInt(match[1]),
            currencyType: match[2]
        };
    }
    return null;
}

// Función para enviar regalo
async function sendGiftToUser(username, offerId, price, isBundle = false) {
    try {
        console.log('Intentando enviar regalo:', { username, offerId, price, isBundle });
        
        // Obtener el catálogo actual
        const catalog = await getCurrentCatalog();
        console.log('Buscando item en catálogo...');

        // Buscar el item en el catálogo
        let foundItem = null;
        for (const storefront of catalog.storefronts) {
            foundItem = storefront.catalogEntries.find(entry => 
                entry.offerId === offerId || 
                entry.id === offerId.replace('v2:/', '') ||
                entry.devName === offerId ||
                entry.offerId === offerId.replace('v2:/', '')
            );
            if (foundItem) {
                console.log('Item encontrado en catálogo:', foundItem);
                break;
            }
        }

        if (!foundItem) {
            console.error('Item no encontrado en el catálogo');
            throw new Error('El item no está disponible actualmente en la tienda');
        }

        // Calcular el precio final
        const itemPrice = calculateItemPrice(foundItem, price);

        if (!itemPrice || itemPrice <= 0) {
            console.error('Precio no disponible para el item');
            throw new Error('El item no tiene un precio válido');
        }

        // Verificar balance
        const balance = await getVBucksBalance();
        console.log('Balance actual:', balance);
        
        if (balance < itemPrice) {
            throw new Error(`insufficient_vbucks:${itemPrice}`);
        }

        // Enviar el regalo usando la función existente
        console.log('Enviando regalo...');
        const result = await sendGift(username, foundItem, itemPrice);
        
        console.log('Regalo enviado con éxito:', result);
        return result;

    } catch (error) {
        console.error('Error en sendGiftToUser:', error);
        throw error;
    }
}

// Endpoint para enviar regalo
app.post('/api/send-gift', async (req, res) => {
    try {
        const { username, offerId, price, isBundle, bundleData } = req.body;
        console.log('Solicitud de regalo recibida:', { username, offerId, price, isBundle });

        // Verificar amistad y tiempo
        const friendshipResult = await checkFriendship(username);
        console.log('Resultado de verificación de amistad:', friendshipResult);

        if (!friendshipResult.success) {
            return res.status(400).json({
                success: false,
                error: 'not_friend',
                message: `Debes agregar a ${process.env.BOT_USERNAME || 'nuestro bot'} como amigo primero`
            });
        }

        if (!friendshipResult.hasMinTime) {
            const hoursLeft = 48 - (friendshipResult.friendshipHours || 0);
            return res.status(400).json({
                success: false,
                error: 'insufficient_time',
                message: `Debes esperar ${Math.ceil(hoursLeft)} horas más antes de poder recibir regalos`,
                hoursLeft: Math.ceil(hoursLeft)
            });
        }

        // Verificar balance
        const balance = await getVBucksBalance();
        console.log('Balance actual:', balance);

        if (balance < price) {
            return res.status(400).json({
                success: false,
                error: 'insufficient_vbucks',
                message: `Balance insuficiente. Se requieren ${price} V-Bucks, balance actual: ${balance}`,
                requiredAmount: price,
                currentBalance: balance
            });
        }

        // Proceder con el envío del regalo
        const giftResult = await sendGift({
            receiverUsername: username,
            offerId,
            receiverAccountId: friendshipResult.accountId,
            price,
            isBundle,
            bundleData
        });

        res.json({
            success: true,
            message: 'Regalo enviado con éxito',
            giftResult
        });

    } catch (error) {
        console.error('Error al enviar regalo:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al enviar el regalo'
        });
    }
});

// Función para enviar el regalo
async function sendGift(giftData) {
    try {
        const { offerId, receiverId, giftWrapTemplateId, bundleInfo } = giftData;
        const requestId = crypto.randomUUID();

        const headers = {
            'Authorization': `Bearer ${botStatus.accessToken}`,
            'Content-Type': 'application/json',
            'X-Epic-Device-ID': requestId,
            'X-Epic-Correlation-ID': requestId
        };

        const payload = {
            offerId: offerId,
            receiverId: receiverId,
            giftWrapTemplateId: giftWrapTemplateId
        };

        // Si es un bundle, agregar la información adicional
        if (bundleInfo) {
            payload.bundleInfo = bundleInfo;
        }

        const response = await axios.post(
            'https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/' + botStatus.accountId + '/gift',
            payload,
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error('Error en sendGift:', error);
        throw error;
    }
}

// Función para calcular el precio final de un item
function calculateItemPrice(item, providedPrice = 0) {
    console.log('Calculando precio para item:', {
        devName: item.devName,
        providedPrice,
        isBundle: !!item.dynamicBundleInfo
    });

    let finalPrice = 0;
    let priceDetails = {};

    // Si es un bundle
    if (item.dynamicBundleInfo) {
        const bundleInfo = item.dynamicBundleInfo;
        
        // Obtener precio base
        const regularPrice = bundleInfo.regularBasePrice || 7500; // Precio por defecto para bundles

        // Calcular descuento si existe
        let discount = 0;
        if (bundleInfo.discountedBasePrice < 0) {
            discount = Math.abs(bundleInfo.discountedBasePrice);
        } else if (bundleInfo.basePrice && bundleInfo.basePrice < regularPrice) {
            discount = regularPrice - bundleInfo.basePrice;
        }

        finalPrice = regularPrice - discount;
        
        // Asegurarse de que no sea menor que el precio mínimo
        if (bundleInfo.floorPrice && finalPrice < bundleInfo.floorPrice) {
            finalPrice = bundleInfo.floorPrice;
        }

        priceDetails = {
            type: 'bundle',
            regularPrice,
            discount,
            floorPrice: bundleInfo.floorPrice,
            finalCalculated: finalPrice
        };
    } 
    // Si es un item normal
    else {
        // Obtener el precio del item
        finalPrice = item.price?.regularPrice || 
                    item.price?.finalPrice || 
                    (item.prices?.find(p => p.type === 'RegularPrice')?.price) || 
                    0;

        priceDetails = {
            type: 'item',
            regularPrice: finalPrice,
            finalCalculated: finalPrice
        };
    }

    console.log('Detalles del cálculo de precio:', priceDetails);
    return finalPrice;
}

// Función para verificar la elegibilidad de un regalo
async function checkGiftEligibility(receiverId, offerId, accessToken) {
    try {
        const hostname = 'fngw-mcp-gc-livefn.ol.epicgames.com';
        const dnsResult = await resolveDNSChain(hostname);
        
        const agent = new https.Agent({
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2',
            maxVersion: 'TLSv1.2',
            secureOptions: crypto.constants.SSL_OP_NO_TLSv1_3,
            ciphers: [
                'ECDHE-ECDSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-ECDSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES256-GCM-SHA384'
            ].join(':'),
            lookup: (hostname, options, callback) => {
                callback(null, dnsResult.ip, 4);
            }
        });

        const url = `https://${hostname}/fortnite/api/storefront/v2/gift/check_eligibility/recipient/${receiverId}/offer/${encodeURIComponent(offerId)}`;
        console.log('URL de verificación:', url);

        const response = await fetch(url, {
            method: 'GET',
            agent,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-24757023 Android/11',
                'X-Epic-Android-Package': 'com.epicgames.fortnite',
                'X-Epic-Android-Version': '11',
                'X-Epic-Client-ID': '3f69e56c7649492c8cc29f1af08a8a12',
                'X-Epic-Client': 'ANDROID'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en verificación de elegibilidad:', errorText);
            throw new Error(`Error verificando elegibilidad: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        console.log('Respuesta de elegibilidad:', data);
        return data;
    } catch (error) {
        console.error('Error en checkGiftEligibility:', error);
        throw error;
    }
}

// Función para resolver DNS recursivamente
async function resolveDNSChain(hostname) {
    const resolveWithService = async (url, service) => {
        try {
            return new Promise((resolve, reject) => {
                const parsedUrl = new URL(url);
                const options = {
                    hostname: parsedUrl.hostname,
                    port: 443,
                    path: `${parsedUrl.pathname}${parsedUrl.search}`,
                    method: 'GET',
                    headers: {
                        'accept': 'application/dns-json'
                    }
                };

                const req = https.request(options, (res) => {
                    let rawData = '';
                    
                    res.on('data', (chunk) => {
                        rawData += chunk;
                    });

                    res.on('end', async () => {
                        try {
                            const data = JSON.parse(rawData);
                            
                            if (!data.Answer) {
                                resolve(null);
                                return;
                            }
                            
                            // Buscar primero registros A
                            const aRecord = data.Answer.find(r => r.type === 1);
                            if (aRecord) {
                                resolve({ ip: aRecord.data, hostname });
                                return;
                            }
                            
                            // Si no hay registro A, buscar CNAME
                            const cname = data.Answer.find(r => r.type === 5);
                            if (cname) {
                                console.log(`${service}: ${hostname} -> CNAME -> ${cname.data}`);
                                // Resolver el CNAME recursivamente
                                const result = await resolveDNSChain(cname.data.replace(/\.$/, ''));
                                resolve(result);
                                return;
                            }
                            
                            resolve(null);
                        } catch (error) {
                            console.error(`Error procesando respuesta DNS de ${service}:`, error);
                            resolve(null);
                        }
                    });
                });

                req.on('error', (error) => {
                    console.error(`Error con ${service}:`, error);
                    resolve(null);
                });

                req.on('timeout', () => {
                    req.destroy();
                    resolve(null);
                });

                req.end();
            });
        } catch (error) {
            console.error(`Error con ${service}:`, error);
            return null;
        }
    };

    // Intentar con múltiples servicios DNS
    const results = await Promise.all([
        resolveWithService(`https://cloudflare-dns.com/dns-query?name=${hostname}&type=A`, 'Cloudflare'),
        resolveWithService(`https://dns.google/resolve?name=${hostname}&type=A`, 'Google')
    ]);

    // Usar el primer resultado válido
    const validResult = results.find(r => r !== null);
    if (validResult) return validResult;

    // Si todo falla, usar valores conocidos
    const knownHosts = {
        'fortnite-public-service-prod.ol.epicgames.com': '99.86.201.129',
        'fngw-mcp-gc-livefn.ol.epicgames.com': '99.86.201.130'
    };

    return { ip: knownHosts[hostname] || '99.86.201.129', hostname };
}

const defaultTlsOptions = {
    rejectUnauthorized: false,
    secureOptions: crypto.constants.SSL_OP_NO_TLSv1_3,
    ciphers: 'DEFAULT:@SECLEVEL=1'
};

const ANDROID_USER_AGENT = 'Fortnite/++Fortnite+Release-24.01-CL-27526713 Android/11';
const ANDROID_AUTH = 'Basic ' + Buffer.from('3f69e56c7649492c8cc29f1af08a8a12:b51ee9cb12234f50a69efa67ef53812e').toString('base64');

async function authenticateBot(authorizationCode) {
    try {
        const body = qs.stringify({
            grant_type: 'authorization_code',
            code: authorizationCode,
            token_type: 'eg1'
        });

        const hostname = 'account-public-service-prod.ol.epicgames.com';
        const dnsResult = await resolveDNSChain(hostname);

        const agent = new https.Agent({
            rejectUnauthorized: false,
            secureOptions: crypto.constants.SSL_OP_NO_TLSv1_3,
            ciphers: 'DEFAULT:@SECLEVEL=1',
            lookup: (hostname, options, callback) => {
                callback(null, dnsResult.ip, 4);
            }
        });

        const response = await fetch(`https://${hostname}/account/api/oauth/token`, {
            method: 'POST',
            agent,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': ANDROID_AUTH,
                'User-Agent': ANDROID_USER_AGENT
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error en la autenticación: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        
        if (!data.access_token) {
            throw new Error('No se recibió token de acceso');
        }

        return data;
    } catch (error) {
        console.error('Error en authenticateBot:', error);
        throw error;
    }
}

// Función para obtener el balance de V-Bucks
async function getBalance() {
    try {
        await ensureBotAuthenticated();
        
        const options = {
            hostname: 'fortnite-public-service-prod11.ol.epicgames.com',
            path: `/fortnite/api/game/v2/profile/${botStatus.accountId}/client/QueryProfile?profileId=common_core&rvn=-1`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${botStatus.accessToken}`,
                'Content-Type': 'application/json'
            },
            ...defaultTlsOptions
        };

        const response = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Error parsing response: ' + e.message));
                    }
                });
            });
            req.on('error', reject);
            req.write('{}');
            req.end();
        });

        if (!response || !response.profileChanges || !response.profileChanges[0] || !response.profileChanges[0].profile) {
            throw new Error('Invalid response format');
        }

        const profile = response.profileChanges[0].profile;
        let mtxBalance = 0;

        // Buscar el balance de V-Bucks en los items del perfil
        if (profile.items) {
            for (const [itemId, item] of Object.entries(profile.items)) {
                if (item.templateId === 'Currency:MtxPurchased') {
                    mtxBalance = item.quantity || 0;
                    break;
                }
            }
        }

        console.log('V-Bucks balance obtained:', mtxBalance);
        return mtxBalance;
    } catch (error) {
        console.error('Error obtaining balance:', error);
        throw new Error('Failed to obtain V-Bucks balance: ' + error.message);
    }
}

// Función para obtener y validar el balance de V-Bucks
async function getVBucksBalance() {
    try {
        if (!botStatus.isAuthenticated) {
            throw new Error('Bot no autenticado');
        }

        // Verificar si el token ha expirado
        if (isBotTokenExpired()) {
            await ensureBotAuthenticated();
        }

        const balance = await getBalance();
        if (typeof balance !== 'number' || balance < 0) {
            throw new Error('Invalid balance received');
        }

        console.log('V-Bucks balance validated:', balance);
        return balance;
    } catch (error) {
        console.error('Error in getVBucksBalance:', error);
        throw new Error(`Error obtaining balance: ${error.message}`);
    }
}

// Función para obtener el catálogo actual
async function getCurrentCatalog() {
    try {
        await ensureBotAuthenticated();
        
        const requestId = crypto.randomUUID();
        const url = 'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/storefront/v2/catalog';

        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'Authorization': `Bearer ${botStatus.accessToken}`,
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-24757023 Android/11',
                'X-Epic-Device-ID': requestId,
                'X-Epic-Correlation-ID': requestId,
                'X-Epic-Android-Package': 'com.epicgames.fortnite',
                'X-Epic-Android-Version': '11',
                'X-Epic-Client-ID': '3f69e56c7649492c8cc29f1af08a8a12',
                'X-Epic-Client': 'ANDROID'
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
                secureProtocol: 'TLS_method',
                ciphers: 'ALL'
            })
        });

        return response.data;
    } catch (error) {
        console.error('Error in getCurrentCatalog:', error);
        throw error;
    }
}

// Agregar nueva función para manejar Device Auth
const deviceAuthPath = path.join(__dirname, 'deviceAuth.json');

async function setupDeviceAuth() {
    try {
        // Intentar cargar Device Auth existente
        console.log('🔄 Intentando cargar Device Auth existente...');
        const deviceAuth = JSON.parse(await fs.readFile(deviceAuthPath, 'utf8'));
        console.log('✅ Device Auth cargado correctamente');
        console.log('🔑 Usando Device Auth para:', deviceAuth.accountId);

        // Intentar autenticar inmediatamente con el Device Auth
        try {
            const response = await axios({
                method: 'POST',
                url: 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic M2Y2OWU1NmM3NjQ5NDkyYzhjYzI5ZjFhZjA4YThhMTI6YjUxZWU5Y2IxMjIzNGY1MGE2OWVmYTY3ZWY1MzgxMmU=',
                    'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-27526713 Android/11'
                },
                data: qs.stringify({
                    grant_type: 'device_auth',
                    device_id: deviceAuth.deviceId,
                    account_id: deviceAuth.accountId,
                    secret: deviceAuth.secret
                })
            });

            if (response.data && response.data.access_token) {
                updateBotStatus({
                    deviceId: deviceAuth.deviceId,
                    accessToken: response.data.access_token,
                    accountId: deviceAuth.accountId,
                    expiresAt: Date.now() + response.data.expires_in * 1000,
                    isAuthenticated: true
                });
                console.log('✅ Bot autenticado exitosamente con Device Auth');
            }
        } catch (error) {
            console.error('❌ Error al autenticar con Device Auth:', error.message);
        }

        return deviceAuth;
    } catch (error) {
        console.error('❌ Error cargando Device Auth:', error.message);
        return null;
    }
}

// Endpoint para verificar la salud del bot
app.get('/api/health', async (req, res) => {
    try {
        // Verificar autenticación del bot
        const isAuthenticated = botStatus.isAuthenticated && botStatus.accessToken && !isBotTokenExpired();
        
        // Verificar balance
        let balance = null;
        let error = null;
        
        if (isAuthenticated) {
            try {
                balance = await getVBucksBalance();
            } catch (e) {
                error = e.message;
            }
        }
        
        res.json({
            status: 'ok',
            isAuthenticated,
            balance,
            error,
            botName: 'Bot Principal'
        });
    } catch (error) {
        console.error('Error en health check:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            botName: 'Bot Principal'
        });
    }
});

// Función para verificar si un usuario es amigo
async function checkFriendship(username) {
    try {
        const accountInfo = await getAccountIdByUsername(username);
        if (!accountInfo) {
            throw new Error('Usuario no encontrado');
        }

        const accountId = accountInfo.id;
        console.log('Verificando amistad para:', {
            username,
            accountId,
            botAccountId: botStatus.accountId
        });

        // Intentar obtener la información específica de amistad
        try {
            const response = await axios.get(
                `https://friends-public-service-prod.ol.epicgames.com/friends/api/v1/${botStatus.accountId}/friends/${accountId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${botStatus.accessToken}`
                    }
                }
            );

            // Verificar el tiempo de amistad
            const friendshipData = response.data;
            const friendshipDate = new Date(friendshipData.created);
            const currentDate = new Date();
            const hoursDiff = (currentDate - friendshipDate) / (1000 * 60 * 60);

            console.log('Verificación de amistad exitosa:', {
                username,
                accountId,
                isFriend: true,
                friendshipInfo: friendshipData,
                friendshipHours: hoursDiff
            });

            return {
                success: true,
                message: 'Es amigo',
                accountId,
                friendshipInfo: friendshipData,
                friendshipHours: hoursDiff,
                hasMinTime: hoursDiff >= 48
            };
        } catch (error) {
            // Si el error es 'friendship_not_found', significa que no son amigos
            if (error.response?.data?.errorCode === 'errors.com.epicgames.friends.friendship_not_found') {
                console.log('No es amigo:', {
                    username,
                    accountId,
                    error: error.response.data
                });

                return {
                    success: false,
                    message: 'No es amigo',
                    accountId,
                    error: error.response.data,
                    hasMinTime: false
                };
            }
            throw error;
        }
    } catch (error) {
        console.error('Error verificando amistad:', error);
        throw error;
    }
}

// Endpoint para verificar si un usuario es amigo
app.get('/api/check-friendship/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await checkFriendship(username);
        res.json(result);
    } catch (error) {
        console.error('Error verificando amistad:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error verificando amistad'
        });
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 3001;

// Iniciar el servidor y configurar el bot
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Servidor iniciado en puerto ${PORT}`);
    setupDeviceAuth().then(() => {
        console.log('✅ Device Auth configurado');
        // Iniciar el sistema de reinicio automático
        setupAutoRestart();
    }).catch(error => {
        console.error('❌ Error configurando Device Auth:', error);
    });
});

// Sistema de reinicio automático
function setupAutoRestart() {
    const RESTART_INTERVAL = 60 * 60 * 1000; // 1 hora en milisegundos
    console.log(`⏰ Configurando reinicio automático cada ${RESTART_INTERVAL / (60 * 1000)} minutos`);

    setInterval(async () => {
        console.log('🔄 Ejecutando reinicio programado...');
        
        try {
            // Resetear el estado del bot
            resetBotStatus();
            
            // Intentar reautenticar
            await setupDeviceAuth();
            
            console.log('✅ Reinicio programado completado');
        } catch (error) {
            console.error('❌ Error durante el reinicio programado:', error);
        }
    }, RESTART_INTERVAL);

    // Manejar errores no controlados
    process.on('uncaughtException', async (error) => {
        console.error('❌ Error no manejado:', error);
        await resetBotStatus();
        await setupDeviceAuth();
    });

    process.on('unhandledRejection', async (error) => {
        console.error('❌ Promesa rechazada no manejada:', error);
        await resetBotStatus();
        await setupDeviceAuth();
    });
}

// Función para resetear el estado del bot
function resetBotStatus() {
    console.log('🔄 Estado del bot reseteado');
    updateBotStatus({
        deviceId: null,
        accessToken: null,
        accountId: null,
        displayName: null,
        expiresAt: null,
        friendToken: null,
        isAuthenticated: false,
        lastError: null
    });
}
