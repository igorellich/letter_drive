const CACHE = 'eat-steak-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const fresh = await fetch(req)
        if (fresh && fresh.status === 200 && req.url.startsWith('http')) {
          cache.put(req, fresh.clone())
        }
        return fresh
      } catch (err) {
        const cached = await cache.match(req)
        if (cached) return cached
        throw err
      }
    })
  )
})