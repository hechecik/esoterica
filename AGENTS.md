# Esoterica — proje kuralları

Bu dosya ajanlar ve katkıcılar içindir. Araştırma ve yapım dokümanı:
https://claude.ai/artifact/8ghFcMHLg12bcqQyAji2Y8

## Değişmez ilkeler
- Tamamen statik; GitHub Pages. Sunucu, API anahtarı, ücretli servis yok.
- Çalışma anında **hiçbir dış ağ isteği yok**: CSP `connect-src 'self'`. Font, kütüphane, görsel repoda.
- Kullanıcı verisi (soru, doğum bilgisi, fal) URL'ye, ağa ya da üçüncü tarafa gitmez.
- Lisans: kod AGPL-3.0, içerik (esoterica-kutuphane) CC BY-NC-SA 4.0. Lisansı belirsiz koddan kopya yok.
- Yorum metinleri özgün Türkçe; telifli kitaptan kopya yok. Korkutucu kehanet (ölüm, kaza, hastalık) yok.
- `Math.random` yok: çekimler `crypto.getRandomValues`, yorum seçimi tohumlu `seeded()`.

## Yapı
- `src/engine/` hesap ve yorum motorları (saf JS, test edilir)
- `src/modules/<fal>/` ekranlar (Svelte 5, runes)
- `content/` git alt modülü: esoterica-kutuphane (YAML). Derleme: `npm run content` → `src/content/generated/*.json` (gitignore'da)
- `tools/` derleme betikleri, `tests/` vitest

## Çalıştırma
```
npm install            # alt modülü de çeker
npm run content        # YAML -> JSON, şema ve genişlik raporu
npm run dev            # http://localhost:5173/esoterica/
npm test
npm run build          # content + vite + sw sürüm damgası
```

## Kurallar
- İçerik değişikliği önce `content/` (alt modül) içinde commit edilir ve push'lanır, sonra ana repoda alt modül işaretçisi güncellenir.
- Yeni fal modülü: motor → içerik şeması → derleyici kontrolü → ekran → test, bu sırayla.
- Her modül `import()` ile tembel yüklenir; ilk açılış 300 KB (gzip) altında kalmalı.
- `main`e doğrudan push yok; `gorev/<ad>` dalı ve onay.
