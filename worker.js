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
