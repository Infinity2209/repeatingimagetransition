const API_ENDPOINT = 'https://your-api-server.com/api/data'; // Replace with your actual API endpoint

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const ASSETS_PREFIX = '/assets/';

  // Serve assets from the assets directory
  if (url.pathname.startsWith(ASSETS_PREFIX)) {
    try {
      return await getAssetFromKV(event, { cacheControl: { bypassCache: true } });
    } catch (e) {
      return new Response('Asset not found', { status: 404 });
    }
  }

  // Example: Fetch data from external API and return JSON response
  if (url.pathname === '/api/data') {
    try {
      const apiResponse = await fetch(API_ENDPOINT);
      const data = await apiResponse.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response('Error fetching data from API', { status: 500 });
    }
  }

  // Serve index.html for root or other paths (SPA fallback)
  if (url.pathname === '/' || url.pathname === '') {
    const index = await fetch(new Request(`${url.origin}/index.html`));
    return new Response(await index.text(), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // For other paths, return 404
  return new Response('Not found', { status: 404 });
}
