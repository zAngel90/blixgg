const { Client } = require('./dist');
const { readFile, writeFile, unlink } = require('fs').promises;
const readline = require('readline');
const path = require('path');

let clientReady = false;
const deviceAuthPath = './deviceAuth.json';

// Función para limpiar credenciales inválidas
const handleCleanup = () => {
  try {
    require('fs').unlinkSync(deviceAuthPath);
    console.log('\n🗑️ Credenciales antiguas eliminadas. Por favor, inicia el bot nuevamente.');
  } catch (e) {
    // Si el archivo no existe, no hay problema
  }
};

// Función para intentar cargar deviceAuth existente
async function loadDeviceAuth() {
  try {
    const data = await readFile(deviceAuthPath);
    const deviceAuth = JSON.parse(data);
    if (!deviceAuth) throw new Error('No device auth found');
    return { deviceAuth };
  } catch (e) {
    console.log('\n⚠️ No se encontraron credenciales guardadas. Necesitas autorizar el bot.');
    return {
      async authorizationCode() {
        console.log('\n📝 Por favor, sigue estos pasos:');
        console.log('1. Abre este enlace en tu navegador:');
        console.log('https://www.epicgames.com/id/api/redirect?clientId=3f69e56c7649492c8cc29f1af08a8a12&responseType=code');
        console.log('2. Inicia sesión con tu cuenta de Epic Games');
        console.log('3. Copia el código de autorización que aparece');
        
        const code = await getUserInput('\n👉 Pega el código de autorización aquí: ');
        if (!code || code.trim() === '') {
          throw new Error('El código de autorización no puede estar vacío');
        }
        return code.trim();
      }
    };
  }
}

// Inicialización del cliente
async function initializeClient() {
  try {
    console.log('\n🔄 Iniciando proceso de autenticación...');
    
    const client = new Client({
      defaultStatus: 'Bot activo!',
      platform: 'Android',
      // Usar el cliente de Android de Fortnite
      authClient: {
        id: '3f69e56c7649492c8cc29f1af08a8a12',
        secret: 'b51ee9cb12234f50a69efa67ef53812e'
      },
      auth: {
        createLauncherSession: true,
        killOtherTokens: false,
        checkEULA: true,
        createFortniteToken: true,
        tokenCreationLocation: 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
      },
      connectToXMPP: true,
      fetchFriends: true,
      partyConfig: {
        joinConfirmation: false,
        chatEnabled: true,
      },
      authorizationCode: async () => {
        console.log('\n📝 Por favor, sigue estos pasos:');
        console.log('1. Abre este enlace en tu navegador en una ventana de incógnito:');
        console.log(`https://www.epicgames.com/id/api/redirect?clientId=3f69e56c7649492c8cc29f1af08a8a12&responseType=code&prompt=login`);
        console.log('2. Inicia sesión con tu cuenta de Epic Games');
        console.log('3. Copia el código de autorización que aparece');
        
        const code = await getUserInput('\n👉 Pega el código de autorización aquí: ');
        if (!code || code.trim() === '') {
          throw new Error('El código de autorización no puede estar vacío');
        }
        console.log('\n🔑 Código recibido, longitud:', code.trim().length);
        return code.trim();
      }
    });

    // Agregar event listeners para rastrear el proceso de autenticación
    client.on('auth:created', () => console.log('\n✓ Token de autenticación creado'));
    client.on('auth:refreshed', () => console.log('\n✓ Token de autenticación actualizado'));
    client.on('auth:error', (error) => console.log('\n❌ Error de autenticación:', error));
    client.on('auth:expired', () => console.log('\n⚠️ Token expirado'));

    console.log('\n⌛ Conectando con Epic Games...');
    await client.login();
    console.log('\n✅ Autenticación exitosa!');

    // Esperar a que el cliente esté completamente listo
    await new Promise((resolve) => {
      const checkReady = async () => {
        try {
          if (client.user && client.user.self) {
            resolve();
          } else {
            setTimeout(checkReady, 1000);
          }
        } catch (error) {
          console.error('Error al inicializar:', error);
          resolve();
        }
      };
      checkReady();
    });

    return client;
  } catch (error) {
    if (error.message.includes('authorization code')) {
      console.error('\n❌ Error: El código de autorización no es válido o ha expirado.');
      console.log('Por favor, asegúrate de:');
      console.log('1. Usar un código nuevo (los códigos expiran rápidamente)');
      console.log('2. Copiar el código completo');
      console.log('3. No incluir espacios extras');
    } else {
      console.error('\n❌ Error durante la autenticación:', error);
      if (error.response) {
        console.log('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
    }
    handleCleanup();
    process.exit(1);
  }
}

// Función para obtener el token de autorización
async function getAuthToken(client) {
  try {
    // Verificar que tenemos el objeto de autenticación
    if (!client.auth) {
      throw new Error('No hay objeto de autenticación disponible');
    }

    // Variable para almacenar el token actual
    let currentToken = null;

    // Verificar las sesiones disponibles
    if (client.auth.sessions) {
      // Intentar con la sesión de Fortnite
      const fortniteSession = client.auth.sessions.get('fortnite');
      if (fortniteSession && fortniteSession.access_token) {
        console.log('✅ Usando sesión existente de Fortnite');
        return `${fortniteSession.token_type || 'bearer'} ${fortniteSession.access_token}`;
      }
    }

    // Si no hay token válido, obtener uno nuevo
    console.log('⌛ Obteniendo nueva sesión con permisos de Fortnite...');
    
    // Obtener código de autorización
    const authCode = await getUserInput('\nIngresa el código de autorización: ');
    if (!authCode || authCode.trim() === '') {
      throw new Error('Código de autorización inválido');
    }

    // Obtener token inicial
    const response = await client.http.epicgamesRequest({
      method: 'POST',
      url: 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `basic ${Buffer.from(`${client.config.authClient.id}:${client.config.authClient.secret}`).toString('base64')}`,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        token_type: 'eg1',
        scope: 'basic_profile friends_list openid presence'
      }).toString()
    });

    if (response.access_token) {
      // Obtener token de intercambio
      const exchangeToken = await client.http.epicgamesRequest({
        method: 'GET',
        url: 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange',
        headers: {
          'Authorization': `${response.token_type || 'bearer'} ${response.access_token}`
        }
      });

      // Obtener token de Fortnite con todos los permisos
      const fortniteToken = await client.http.epicgamesRequest({
        method: 'POST',
        url: 'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `basic ${Buffer.from(`${client.config.authClient.id}:${client.config.authClient.secret}`).toString('base64')}`,
          'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
        },
        data: new URLSearchParams({
          grant_type: 'exchange_code',
          exchange_code: exchangeToken.code,
          token_type: 'eg1',
          scope: 'fortnite:profile:* fortnite:stats:* fortnite:cloudstorage:* fortnite:storefront:* fortnite:commerce:*'
        }).toString()
      });

      if (fortniteToken.access_token) {
        // Guardar el token en la sesión
        if (!client.auth.sessions) {
          client.auth.sessions = new Map();
        }

        client.auth.sessions.set('fortnite', fortniteToken);
        console.log('✅ Token de Fortnite guardado en sesión');
        
        return `${fortniteToken.token_type || 'bearer'} ${fortniteToken.access_token}`;
      }
    }

    throw new Error('No se pudo obtener un token válido');
  } catch (error) {
    console.error('❌ Error al obtener token:', error.message);
    if (error.response) {
      console.log('Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
}

// Función para obtener el catálogo actual
async function getCatalog(client) {
  try {
    const authToken = await getAuthToken(client);
    console.log('Token obtenido:', authToken.substring(0, 50) + '...');

    const response = await client.http.epicgamesRequest({
      method: 'GET',
      url: 'https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/storefront/v2/catalog',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
      }
    });

    if (!response || !response.storefronts) {
      throw new Error('Respuesta del catálogo inválida');
    }

    // Procesar el catálogo para obtener solo los items regalables
    const giftableItems = [];
    response.storefronts.forEach(storefront => {
      if (storefront.catalogEntries) {
        storefront.catalogEntries.forEach(entry => {
          if (entry.giftInfo && entry.giftInfo.bIsEnabled) {
            giftableItems.push({
              title: entry.title || entry.devName,
              offerId: entry.offerId,
              price: entry.price?.regularPrice || 0,
              finalPrice: entry.price?.finalPrice || 0,
              giftable: true
            });
          }
        });
      }
    });

    if (giftableItems.length === 0) {
      throw new Error('No se encontraron items regalables en el catálogo');
    }

    console.log(`\n✅ Se encontraron ${giftableItems.length} items regalables`);
    return giftableItems;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.log('Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw new Error(`Error al obtener catálogo: ${error.message}`);
  }
}

// Función para verificar elegibilidad de regalo
async function checkGiftEligibility(client, friendId, offerId) {
  try {
    const authToken = await getAuthToken(client);
    const response = await client.http.epicgamesRequest({
      method: 'GET',
      url: `https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/storefront/v2/gift/check_eligibility/recipient/${friendId}/offer/${encodeURIComponent(offerId)}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
    });
    return response;
  } catch (error) {
    console.error('Error completo:', error);
    throw new Error(`Error al verificar elegibilidad: ${error.message}`);
  }
}

// Función para enviar regalo
async function sendGift(client, offerId, recipientId, giftMessage) {
  try {
    console.log('\n⌛ Preparando envío del regalo...');
    
    // Verificar si el usuario puede recibir regalos
    console.log('Verificando si el usuario puede recibir regalos...');
    await canReceiveGifts(client, recipientId);
    
    const authToken = await getAuthToken(client);
    const accountId = client.user.self.id;

    // Verificar que tenemos todos los datos necesarios
    if (!offerId || !recipientId || !accountId) {
      throw new Error('Faltan datos necesarios para enviar el regalo');
    }

    console.log('Datos del regalo:', {
      offerId,
      recipientId,
      accountId,
      giftMessage
    });

    const response = await client.http.epicgamesRequest({
      method: 'POST',
      url: `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${accountId}/client/GiftCatalogEntry`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
      },
      data: {
        offerId: offerId,
        receiverAccountIds: [recipientId],
        giftWrapTemplateId: "GiftBox:GB_Default",
        personalMessage: giftMessage || "¡Disfruta tu regalo!",
        accountId: accountId
      }
    });

    if (!response || response.error) {
      throw new Error(response?.error || 'Error al enviar el regalo');
    }

    console.log('\n✅ Regalo enviado exitosamente');
    console.log(`Destinatario: ${recipientId}`);
    console.log(`Mensaje: ${giftMessage || "¡Disfruta tu regalo!"}`);
    
    return response;
  } catch (error) {
    if (error.message.includes('no puede recibir regalos')) {
      console.log('\n❌ ' + error.message);
    } else {
      console.error('\n❌ Error al enviar el regalo:', error.message);
      if (error.response) {
        console.log('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
    }
    throw error;
  }
}

// Función para enviar un regalo
async function sendGift(client, itemId, recipientId, giftMessage = '¡Disfruta tu regalo!') {
  try {
    console.log(`\n⌛ Enviando regalo (${itemId}) a ${recipientId}...`);
    
    const authToken = await getAuthToken(client);
    
    // Obtener el perfil del usuario
    const profileResponse = await client.http.epicgamesRequest({
      method: 'POST',
      url: 'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/profile/' + client.account.id + '/client/QueryProfile?profileId=common_core&rvn=-1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
      },
      data: {}
    });

    // Enviar el regalo
    const response = await client.http.epicgamesRequest({
      method: 'POST',
      url: 'https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/profile/' + client.account.id + '/client/GiftCatalogEntry?profileId=common_core&rvn=-1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
      },
      data: {
        offerId: itemId,
        receiverAccountIds: [recipientId],
        giftWrapTemplateId: "GiftBox:GB_Default",
        personalMessage: giftMessage
      }
    });

    console.log('\n✅ Regalo enviado con éxito!');
    return response;
  } catch (error) {
    console.error('\n❌ Error al enviar el regalo:', error);
    if (error.response) {
      console.log('Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw new Error(`Error al enviar regalo: ${error.message}`);
  }
}

// Función para buscar ID de Epic Games
async function findEpicId(client, username) {
  try {
    console.log(`\n⌛ Buscando ID de Epic Games para: ${username}`);
    
    const authToken = await getAuthToken(client);
    
    const response = await client.http.epicgamesRequest({
      method: 'GET',
      url: `https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/${encodeURIComponent(username)}`,
      headers: {
        'Authorization': authToken,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
      }
    });

    if (response && response.id) {
      console.log(`✅ ID encontrado: ${response.id}`);
      console.log(`Nombre de usuario: ${response.displayName}`);
      return response.id;
    }
    
    throw new Error('No se encontró el ID');
  } catch (error) {
    console.error('\n❌ Error al buscar ID:', error.message);
    if (error.response) {
      console.log('Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
}

// Función para verificar si un usuario puede recibir regalos
async function canReceiveGifts(client, recipientId) {
  try {
    const authToken = await getAuthToken(client);
    
    const response = await client.http.epicgamesRequest({
      method: 'POST',
      url: `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${recipientId}/client/QueryProfile`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12',
        'Profile-Id': 'common_core'
      },
      data: {
        profileId: 'common_core'
      }
    });

    if (!response || response.error) {
      throw new Error(response?.error || 'No se pudo verificar el estado de regalos');
    }

    // Verificar si la cuenta puede recibir regalos
    if (response.profileChanges && response.profileChanges[0]) {
      const profile = response.profileChanges[0];
      
      // Verificar si la cuenta está bloqueada para regalos
      if (profile.profile && profile.profile.stats && profile.profile.stats.attributes) {
        const attrs = profile.profile.stats.attributes;
        
        // Verificar la fecha de creación de la cuenta
        const accountCreationDate = new Date(attrs.created);
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Verificar si han pasado 2 días y si no está bloqueado para regalos
        const canReceive = accountCreationDate <= twoDaysAgo && !attrs.gift_history?.receiving_blocked;

        if (!canReceive) {
          if (accountCreationDate > twoDaysAgo) {
            const timeLeft = Math.ceil((twoDaysAgo - accountCreationDate) / (1000 * 60 * 60 * 24));
            throw new Error(`El usuario no puede recibir regalos todavía. Debe esperar ${Math.abs(timeLeft)} días más.`);
          } else if (attrs.gift_history?.receiving_blocked) {
            throw new Error('El usuario tiene bloqueada la recepción de regalos.');
          }
        }

        return true;
      }
    }

    throw new Error('No se pudo verificar el estado de regalos del usuario');
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Usuario no encontrado');
    }
    throw error;
  }
}

// Función para enviar regalo
async function sendGift(client, offerId, recipientId, giftMessage) {
  try {
    console.log('\n⌛ Preparando envío del regalo...');
    
    // Verificar si el usuario puede recibir regalos
    console.log('Verificando si el usuario puede recibir regalos...');
    await canReceiveGifts(client, recipientId);
    
    const authToken = await getAuthToken(client);
    const accountId = client.user.self.id;

    // Verificar que tenemos todos los datos necesarios
    if (!offerId || !recipientId || !accountId) {
      throw new Error('Faltan datos necesarios para enviar el regalo');
    }

    console.log('Datos del regalo:', {
      offerId,
      recipientId,
      accountId,
      giftMessage
    });

    const response = await client.http.epicgamesRequest({
      method: 'POST',
      url: `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${accountId}/client/GiftCatalogEntry`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
      },
      data: {
        offerId: offerId,
        receiverAccountIds: [recipientId],
        giftWrapTemplateId: "GiftBox:GB_Default",
        personalMessage: giftMessage || "¡Disfruta tu regalo!",
        accountId: accountId
      }
    });

    if (!response || response.error) {
      throw new Error(response?.error || 'Error al enviar el regalo');
    }

    console.log('\n✅ Regalo enviado exitosamente');
    console.log(`Destinatario: ${recipientId}`);
    console.log(`Mensaje: ${giftMessage || "¡Disfruta tu regalo!"}`);
    
    return response;
  } catch (error) {
    if (error.message.includes('no puede recibir regalos')) {
      console.log('\n❌ ' + error.message);
    } else {
      console.error('\n❌ Error al enviar el regalo:', error.message);
      if (error.response) {
        console.log('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
    }
    throw error;
  }
}

// Función para verificar si un usuario es amigo y por cuánto tiempo
async function checkFriendshipStatus(client, recipientId) {
  try {
    // Obtener la lista de amigos
    const friends = client.friend.list;
    const friend = Array.from(friends.values()).find(f => f.id === recipientId);

    if (!friend) {
      throw new Error('El usuario no está en tu lista de amigos. Debes agregarlo primero.');
    }

    // Verificar la fecha de amistad
    const friendshipDate = friend.createdAt || new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    if (friendshipDate > twoDaysAgo) {
      const timeLeft = Math.ceil((twoDaysAgo - friendshipDate) / (1000 * 60 * 60 * 24));
      throw new Error(`Debes esperar ${Math.abs(timeLeft)} días más para poder enviar regalos a este amigo.`);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

// Modificar la función sendGift para incluir la verificación de amistad
async function sendGift(client, offerId, recipientId, giftMessage) {
  try {
    console.log('\n⌛ Preparando envío del regalo...');
    
    // Verificar la amistad primero
    console.log('Verificando estado de amistad...');
    await checkFriendshipStatus(client, recipientId);
    
    // Verificar si el usuario puede recibir regalos
    console.log('Verificando si el usuario puede recibir regalos...');
    await canReceiveGifts(client, recipientId);
    
    const authToken = await getAuthToken(client);
    const accountId = client.user.self.id;

    // Verificar que tenemos todos los datos necesarios
    if (!offerId || !recipientId || !accountId) {
      throw new Error('Faltan datos necesarios para enviar el regalo');
    }

    console.log('Datos del regalo:', {
      offerId,
      recipientId,
      accountId,
      giftMessage
    });

    const response = await client.http.epicgamesRequest({
      method: 'POST',
      url: `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${accountId}/client/GiftCatalogEntry`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
        'User-Agent': 'Fortnite/++Fortnite+Release-24.01-CL-25892170 Android/12'
      },
      data: {
        offerId: offerId,
        receiverAccountIds: [recipientId],
        giftWrapTemplateId: "GiftBox:GB_Default",
        personalMessage: giftMessage || "¡Disfruta tu regalo!",
        accountId: accountId
      }
    });

    if (!response || response.error) {
      throw new Error(response?.error || 'Error al enviar el regalo');
    }

    console.log('\n✅ Regalo enviado exitosamente');
    console.log(`Destinatario: ${recipientId}`);
    console.log(`Mensaje: ${giftMessage || "¡Disfruta tu regalo!"}`);
    
    return response;
  } catch (error) {
    if (error.message.includes('no está en tu lista de amigos') || 
        error.message.includes('debes esperar') ||
        error.message.includes('no puede recibir regalos')) {
      console.log('\n❌ ' + error.message);
    } else {
      console.error('\n❌ Error al enviar el regalo:', error.message);
      if (error.response) {
        console.log('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
    }
    throw error;
  }
}

// Función para procesar el menú de regalos
async function handleGiftMenu(client, catalog) {
  try {
    console.log('\n=== MENÚ DE REGALOS ===');
    
    // Mostrar los items disponibles
    catalog.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title || item.offerId}`);
    });

    // Obtener selección del usuario
    const selection = await getUserInput('\nSelecciona el número del item a regalar: ');
    const selectedIndex = parseInt(selection) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= catalog.length) {
      throw new Error('Selección inválida');
    }

    const selectedItem = catalog[selectedIndex];
    console.log(`\nHas seleccionado: ${selectedItem.title || selectedItem.offerId}`);

    // Buscar ID del destinatario
    const username = await getUserInput('\nIngresa el nombre de usuario de Epic Games del destinatario: ');
    if (!username || username.trim() === '') {
      throw new Error('Nombre de usuario inválido');
    }

    // Obtener el ID
    const recipientId = await findEpicId(client, username.trim());
    console.log(`\nID del destinatario: ${recipientId}`);

    // Obtener mensaje personalizado (opcional)
    const giftMessage = await getUserInput('\nIngresa un mensaje personalizado (opcional, presiona Enter para omitir): ');

    // Confirmar el envío
    const confirm = await getUserInput('\n¿Deseas enviar el regalo? (s/n): ');
    if (confirm.toLowerCase() !== 's') {
      throw new Error('Envío cancelado por el usuario');
    }

    // Enviar el regalo
    await sendGift(client, selectedItem.offerId, recipientId, giftMessage.trim() || '¡Disfruta tu regalo!');
    
    console.log('\n🎁 ¡Regalo enviado con éxito!');
  } catch (error) {
    console.error('\n❌ Error al procesar el regalo:', error.message);
  }
}

// Función para mostrar el menú
function showMainMenu() {
  console.clear();
  console.log('\n=== MENÚ PRINCIPAL ===');
  console.log('1. Agregar amigo');
  console.log('2. Ver lista de amigos');
  console.log('3. Enviar mensaje a amigo');
  console.log('4. Enviar mensaje al equipo');
  console.log('5. Ver miembros del equipo');
  console.log('6. Enviar regalo');
  console.log('7. Salir');
}

// Función para leer input
async function getUserInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Manejador del menú
async function handleMenu(client) {
  if (!client.friend) {
    console.error('\n❌ Error: El sistema de amigos no está disponible');
    process.exit(1);
  }

  console.clear();
  console.log(`\n🤖 Bot conectado exitosamente`);
  console.log(`👤 Usuario: ${client.user.self.displayName}`);
  console.log(`📊 Estado: ${client.user.self.status || 'En línea'}\n`);
  
  // Mostrar información de amigos inicial
  const friendCount = client.friend.list.size;
  console.log(`👥 Amigos conectados: ${friendCount}`);
  
  await getUserInput('Presiona Enter para mostrar el menú...');

  while (true) {
    showMainMenu();
    const option = await getUserInput('\nSelecciona una opción: ');

    switch (option) {
      case '1':
        const username = await getUserInput('\nIngresa el nombre de usuario: ');
        try {
          await client.friend.add(username);
          console.log(`\n✅ Solicitud de amistad enviada a: ${username}`);
        } catch (error) {
          console.log(`\n❌ Error al agregar a ${username}: ${error.message}`);
        }
        await getUserInput('\nPresiona Enter para continuar...');
        break;

      case '2':
        console.log('\n=== LISTA DE AMIGOS ===');
        const friends = client.friend.list;
        if (friends.size === 0) {
          console.log('No tienes amigos en tu lista.');
        } else {
          friends.forEach((friend) => {
            const status = friend.status || 'Desconectado';
            console.log(`${friend.displayName} - ${status}`);
          });
        }
        await getUserInput('\nPresiona Enter para continuar...');
        break;

      case '3':
        const friendName = await getUserInput('\nIngresa el nombre del amigo: ');
        const message = await getUserInput('Ingresa el mensaje: ');
        try {
          const friend = Array.from(client.friend.list.values()).find(f => 
            f.displayName && f.displayName.toLowerCase() === friendName.toLowerCase()
          );

          if (friend) {
            await friend.sendMessage(message);
            console.log('\n✅ Mensaje enviado correctamente');
          } else {
            console.log('\n❌ Amigo no encontrado. Asegúrate de escribir el nombre exactamente como aparece en tu lista de amigos.');
          }
        } catch (error) {
          console.log('\n❌ Error al enviar mensaje:', error.message);
        }
        await getUserInput('\nPresiona Enter para continuar...');
        break;

      case '4':
        try {
          if (!client.party) {
            console.log('\n❌ No estás en ningún equipo actualmente.');
            await getUserInput('\nPresiona Enter para continuar...');
            break;
          }

          const partyMessage = await getUserInput('\nIngresa el mensaje para el equipo: ');
          await client.party.chat.send(partyMessage);
          console.log('\n✅ Mensaje enviado al equipo correctamente');
        } catch (error) {
          console.log('\n❌ Error al enviar mensaje al equipo:', error.message);
        }
        await getUserInput('\nPresiona Enter para continuar...');
        break;

      case '5':
        try {
          if (!client.party) {
            console.log('\n❌ No estás en ningún equipo actualmente.');
          } else {
            console.log('\n=== MIEMBROS DEL EQUIPO ===');
            const members = client.party.members;
            members.forEach(member => {
              const isLeader = member.id === client.party.leader.id ? '👑 ' : '';
              console.log(`${isLeader}${member.displayName}`);
            });
          }
        } catch (error) {
          console.log('\n❌ Error al obtener miembros del equipo:', error.message);
        }
        await getUserInput('\nPresiona Enter para continuar...');
        break;

      case '6':
        try {
          console.log('\n=== ENVIAR REGALO ===');
          
          // Mostrar estado de autenticación
          console.log('\nEstado de autenticación inicial:', {
            hasAuth: !!client.auth,
            hasSessions: !!client.auth?.sessions,
            sessionCount: client.auth?.sessions?.size || 0
          });

          // Obtener el catálogo
          console.log('\n⌛ Obteniendo catálogo...');
          const catalog = await getCatalog(client);
          
          if (!catalog || catalog.length === 0) {
            throw new Error('No hay items disponibles para regalar');
          }

          // Mostrar los items disponibles
          console.log('\nItems disponibles para regalar:');
          catalog.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title} - ${item.finalPrice} V-Bucks`);
          });

          // Obtener selección del usuario
          const selection = await getUserInput('\nSelecciona el número del item a regalar: ');
          const selectedIndex = parseInt(selection) - 1;

          if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= catalog.length) {
            throw new Error('Selección inválida');
          }

          const selectedItem = catalog[selectedIndex];
          console.log(`\nHas seleccionado: ${selectedItem.title}`);

          // Buscar ID del destinatario
          const recipientName = await getUserInput('\nIngresa el nombre de usuario de Epic Games del destinatario: ');
          if (!recipientName || recipientName.trim() === '') {
            throw new Error('Nombre de usuario inválido');
          }

          // Obtener el ID
          const recipientId = await findEpicId(client, recipientName.trim());
          console.log(`\nID del destinatario: ${recipientId}`);

          // Obtener mensaje personalizado (opcional)
          const giftMessage = await getUserInput('\nIngresa un mensaje personalizado (opcional, presiona Enter para omitir): ');

          // Confirmar el envío
          const confirm = await getUserInput('\n¿Deseas enviar el regalo? (s/n): ');
          if (confirm.toLowerCase() !== 's') {
            throw new Error('Envío cancelado por el usuario');
          }

          // Enviar el regalo
          await sendGift(client, selectedItem.offerId, recipientId, giftMessage.trim() || '¡Disfruta tu regalo!');
          console.log('\n🎁 ¡Regalo enviado con éxito!');
        } catch (error) {
          console.error('\n❌ Error al procesar el regalo:', error.message);
        }
        await getUserInput('\nPresiona Enter para continuar...');
        break;

      case '7':
        console.log('\n👋 ¡Hasta luego!');
        process.exit(0);

      default:
        console.log('\n❌ Opción no válida. Por favor, intenta de nuevo.');
        await getUserInput('\nPresiona Enter para continuar...');
    }
  }
}

// Iniciar el bot
console.log('\n🎮 Bienvenido al Bot de Fortnite');
console.log('📝 Si es la primera vez, necesitarás autorizar el bot:');
console.log('1. Ve a https://www.epicgames.com/id/api/redirect?clientId=3f69e56c7649492c8cc29f1af08a8a12&responseType=code');
console.log('2. Inicia sesión con tu cuenta de Epic Games');
console.log('3. Copia el código de autorización que aparece');
console.log('4. Pégalo aquí cuando se te solicite\n');

initializeClient()
  .then(async (client) => {
    // Guardar deviceAuth cuando se genere
    client.on('deviceauth:created', async (da) => {
      try {
        await writeFile(deviceAuthPath, JSON.stringify(da, null, 2));
        console.log('\n💾 Credenciales guardadas correctamente');
      } catch (error) {
        console.error('\n❌ Error al guardar credenciales:', error.message);
      }
    });

    // Iniciar el menú directamente después de la autenticación
    try {
      await handleMenu(client);
    } catch (error) {
      console.error('\n❌ Error al mostrar el menú:', error.message);
    }

    // Eventos del cliente
    client.on('friend:request', (request) => {
      console.log(`\n📨 Nueva solicitud de amistad de: ${request.displayName}`);
      request.accept().catch(error => {
        console.error(`❌ Error al aceptar solicitud de amistad: ${error.message}`);
      });
    });

    client.on('friend:added', (friend) => {
      console.log(`\n✅ Nuevo amigo agregado: ${friend.displayName}`);
    });

    client.on('friend:removed', (friend) => {
      console.log(`\n❌ Amigo eliminado: ${friend.displayName}`);
    });

    client.on('friend:message', (message) => {
      console.log(`\n💬 Mensaje de ${message.author.displayName}: ${message.content}`);
      if (message.content.toLowerCase() === 'ping') {
        message.reply('¡Pong! 🏓');
      }
    });

    client.on('party:member:joined', (member) => {
      console.log(`\n👋 ${member.displayName} se unió al equipo`);
      // Intentar reconectar al chat cuando alguien se une
      if (client.party) {
        client.chat.joinPartyChat(client.party.id).catch(() => {});
      }
    });

    client.on('party:member:left', (member) => {
      console.log(`\n👋 ${member.displayName} dejó el equipo`);
    });

    client.on('party:member:message', (message) => {
      console.log(`\n💬 [Equipo] ${message.author.displayName}: ${message.content}`);
    });

    // Eventos adicionales de chat
    client.on('chat:message', (message) => {
      console.log(`\n💬 [Chat] ${message.author.displayName}: ${message.content}`);
    });

    client.on('chat:error', (error) => {
      console.error('\n❌ Error de chat:', error.message);
    });

    client.on('xmpp:chat:error', (error) => {
      console.error('\n❌ Error de chat:', error.message);
    });

    client.on('error', (error) => {
      console.error('\n❌ Error:', error.message);
    });

    // Manejar el cierre del programa
    process.on('SIGINT', () => {
      console.log('\n👋 Cerrando el bot...');
      client.logout();
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('\n❌ Error al inicializar el bot:', error.message);
    handleCleanup();
    process.exit(1);
  });