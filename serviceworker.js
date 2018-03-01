/* ephemeris - a software astronomical almanach 

Copyright 2017 Herr_Alien <alexandru.garofide@gmail.com>

This program is free software: you can redistribute it and/or modify it under 
the terms of the GNU Affero General Public License as published by the 
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY 
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see <https://www.gnu.org/licenses/agpl.html>. */
(function() {
var CACHE_PREFIX = 'Cache-for-ephemerides';
var CACHE_VERSION = '118';
var CACHE_NAME = CACHE_PREFIX + '-' + CACHE_VERSION;

var optionalUrlsToCache = [
"aajs.js.mem",
];

var urlsToCache = [
".",
"index.html",
"manifest.json",
"style/default.css",
"style/common.css",
"js/aajs.js",
"js/besselianelements.js",
"js/galileanmoonsdata.js",
"js/galileanmoonspage.js",
"js/jupiter.js",
"js/location.js",
"js/mars.js",
"js/matrix.js",
"js/mercury.js",
"js/moon.js",
"js/mooneclipsesdata.js",
"js/mooneclipsespage.js",
"js/moonsdata.js",
"js/moonspage.js",
"js/neptune.js",
"js/notifications.js",
"js/numerical.js",
"js/pagerank.js",
"js/planetdata.js",
"js/planetpage.js",
"js/realtime.js",
"js/realtimedata.js",
"js/risetransitset.js",
"js/saturn.js",
"js/saturnmoonsdata.js",
"js/saturnmoonspage.js",
"js/searchform.js",
"js/solareclipsesdata.js",
"js/solareclipsespage.js",
"js/sun.js",
"js/timeinput.js",
"js/uranus.js",
"js/venus.js",
"images/ae-icon.png",
"images/ae-icon-144.png",
"images/ae-icon-192.png",
"images/ae-icon-256.png",
"images/ae-icon-512.png",
"images/double-arrow.svg",
"images/galilean-moons.svg",
"images/home-3.svg",
"images/icon.svg",
"images/jupiter.svg",
"images/loading.gif",
"images/logo.png",
"images/logomobilebanner.png",
"images/lunar-eclipse.svg",
"images/magnifying-glass.svg",
"images/mars.svg",
"images/menu.svg",
"images/mercury.svg",
"images/moon.svg",
"images/neptune.svg",
"images/saturn.svg",
"images/saturn-moons.svg",
"images/settings.svg",
"images/solar-eclipse.svg",
"images/sun.svg",
"images/uranus.svg",
"images/venus.svg"
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        cache.addAll (optionalUrlsToCache);
        return cache.addAll(urlsToCache);
      })
  );
});


function fetchAndCache (req) {
  return fetch (req.clone()).then (resp => {
    if(!resp || resp.status !== 200 || resp.type !== 'basic') {
      return resp;
    }

    var responseToCache = resp.clone();
    caches.open(CACHE_NAME)
      .then(function(cache) {
        cache.put(req, responseToCache);
       });

    return resp;
  });
}

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          // analyze it
          console.log ("Cache hit for " + response.url);

          return response.clone().blob().then(dataAsBlob => {
            if (dataAsBlob) {
              console.log ("URL " + response.url + " has " + dataAsBlob.size + " bytes" + 
                            response.useFinalURL ? ", final " : ", not final");
            } else {
              console.log ("No data as blob");
            }

            if (!dataAsBlob || dataAsBlob.size == 0) {
              return fetchAndCache(event.request);
            }

            return response;
            
          });
         
        } else {
          console.log ("Cache miss for " + event.request.url);
          return fetchAndCache (event.request);
        }
      }
    )
  );
});

function shouldDestroy(name){
    return ((name.startsWith(CACHE_PREFIX)) && (name != CACHE_NAME));
}

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (shouldDestroy(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

})();
