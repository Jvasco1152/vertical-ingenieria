// Script para probar la API de imágenes

const projectId = 'cmjthmz6g0006vfxsuf43jov2'; // ID real de la BD

async function testAPI() {
  console.log('\n🧪 Probando API de imágenes...\n');

  try {
    const url = `http://localhost:3000/api/projects/${projectId}/images`;
    console.log(`📡 GET ${url}`);

    const response = await fetch(url);

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log(`📄 Response (first 500 chars):`);
    console.log(text.substring(0, 500));

    if (response.status === 200) {
      try {
        const json = JSON.parse(text);
        console.log('\n✅ JSON Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('\n⚠️  Response is not JSON');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAPI();
