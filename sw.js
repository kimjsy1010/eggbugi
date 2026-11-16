// 인터넷이 끊겨도 앱이 열리도록 화면 파일만 저장해 둔다. 아이들 기록은 여기 없고 브라우저 저장소(localStorage)에 있다.
// 화면을 고친 뒤에는 VERSION 숫자를 올려야 태블릿이 새 화면을 받는다.
const VERSION = 'eggbugi-v9';
const FILES = ['./', './index.html', './firebase-config.js', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './art/boogi.png','./art/chameleon.png','./art/cobra.png','./art/crocodile.png','./art/duck.png','./art/echidna.png','./art/octopus.png','./art/owl.png','./art/peacock.png','./art/penguin.png','./art/platypus.png','./art/salamander.png','./art/shark.png','./art/trex.png'];
// 우리 파일 말고도 화면을 그리는 데 필요한 것(Firebase 프로그램, 글꼴)은 저장해 둔다. 기록 주고받기(firestore.googleapis.com)는 저장하지 않는다.
const SHARED_HOSTS = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'hangeul.pstatic.net'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

// 새 화면이 있으면 먼저 받고, 인터넷이 없으면 저장해 둔 화면을 쓴다.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || (url.origin !== self.location.origin && !SHARED_HOSTS.includes(url.host))) return;
  event.respondWith(fetch(event.request)
    .then(response => {
      const copy = response.clone();
      caches.open(VERSION).then(cache => cache.put(event.request, copy));
      return response;
    })
    .catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html'))));
});
