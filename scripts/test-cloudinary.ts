import { v2 as cloudinary } from 'cloudinary';

// Configurar con las credenciales del .env.local
cloudinary.config({
  cloud_name: 'dwcejifii',
  api_key: '365675144951949',
  api_secret: 'kAx6nYattBoQssfwj48_ycAeHGM',
});

async function testCloudinary() {
  console.log('\n🧪 Probando credenciales de Cloudinary...\n');

  try {
    // Intentar obtener información básica de la cuenta
    const result = await cloudinary.api.ping();
    console.log('✅ Credenciales VÁLIDAS!');
    console.log('📊 Respuesta de Cloudinary:', result);
  } catch (error: any) {
    console.error('❌ Credenciales INVÁLIDAS');
    console.error('Error:', error.message);
    console.error('\n📝 Verifica que:');
    console.error('   1. El Cloud Name sea correcto');
    console.error('   2. El API Key sea correcto');
    console.error('   3. El API Secret sea correcto');
    console.error('\n🔗 Obtén tus credenciales en:');
    console.error('   https://console.cloudinary.com/');
  }
}

testCloudinary();
