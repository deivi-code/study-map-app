const CACHE = "study-map-v1"

self.addEventListener("install", (e) => {
  self.skipWaiting()
})

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim())
})

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(e.request)
      if (cached) return cached
      const response = await fetch(e.request)
      if (response.ok && e.request.method === "GET") {
        cache.put(e.request, response.clone())
      }
      return response
    })(),
  )
})
