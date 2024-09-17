const cacheName = "RomanDog-VWR_Concept-1.0.2";
const contentToCache = [
    "Build/81ed1880f4c4ef2eb6487d4721eb1107.loader.js",
    "Build/9f9e87eaceb21064b14ba5ece7f1937e.framework.js.unityweb",
    "Build/fd98c0b90ec659fdaff494e0a99f39df.data.unityweb",
    "Build/1686ab74a8490df8e9265d4105f0fb3a.wasm.unityweb",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
