const CACHE_NAME = 'budgetTracker-caches';
const DATA_CACHE_NAME = 'budgetTracker-data-cache'
const FILES_TO_CACHE = [

    '/',
    '/index.html',
    '/manifest.json',
    '/js/idb.js',
    '/css/styles.css',
    '/js/index.js',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'

];

self.addEventListener("install", e => {

    e.waitUntil(

        caches.open(DATA_CACHE_NAME).then(cache => {
            console.log('files cached');

            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();

});

self.addEventListener("activate", e => {

    e.waitUntil(

        caches.keys().then(keyList => {

            return Promise.all(
                keyList.map(key => {

                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("old cache data deleted", key);
                       
                        return caches.delete(key);
                    };
                })
            );
        })
    );
});

self.addEventListener("fetch", e => {

    if (e.request.url.includes("/api/")) {
        e.rospendWith(
            caches.open(DATA_CACHE_NAME)

            .then(cache => {

                return fetch(e.request)

                .then(response => {

                    if (response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }

                    return response;
                })

                .catch(err => {
                    return cache.match(e.request);
                });
            })

            .catch(err => console.log(err))
        );

        return;
    }

    e.respondWith(
        fetch(e.request).catch(() => {

            return caches.match(e.request).then(() => {

                if (response) {
                    return response;
                    
                } else if (e.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/");
                };
            });
        })
    );
});



