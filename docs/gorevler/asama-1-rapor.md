# Aşama 1 raporu: iskelet ve remil

Tarih: 2026-11-16 · Dal: `gorev/asama-1` (iki repoda da)

## Yapılanlar
- Site reposu: Vite + Svelte 5 iskeleti, tasarım sistemi (gece laciverti, eski altın, Cormorant Garamond + IBM Plex Sans, yerel fontlar), yıldız alanı, hash yönlendirme + View Transitions.
- Remil: 16 şekil, kalkan hesabı, 12 hane, gelinme (işgal, kavuşma, mutasyon, nakil), noktanın yolu, üçüncü kişi için hane döndürme.
- Yorum motoru: tartma (doğa, hız, tekrar, çelişki, tema), anlatı iskeleti, Türkçe ek motoru, tohumlu seçim ve görülen-cümle cezası. Aynı gün aynı tablo aynı metin.
- İçerik reposu: 16 şekil portresi, 192 hücre (3 ton), gelinme ve iskelet şablonları, ortak sözlük, şema ve yasak kelime listesi. 2.194 benzersiz cümle, ~41.000 iskelet kombinasyonu (derleyici raporu).
- Ekranlar: niyet → kum (dokunarak çizgi; kâğıttan giriş; kripto rastgele) → kalkan (sağdan sola, animasyonlu) → yorum (bölüm bölüm açılır).
- Gizlilik: CSP meta, no-referrer, dış istek sıfır (dist taraması ve tarayıcı testi), service worker ile çevrimdışı ve ön yükleme, PWA manifest.

## Testler
97/97 (şekiller, iki kabul tablosu birebir, Türkçe ekler, içerik bütünlüğü, tekrarsızlık, üçüncü kişi, yasak kelime).

## Kapı: Aşama 1
- [x] İki kabul tablosu motorda birebir (hâkim, uzlaştırıcı, nakil ve işgal tespiti)
- [x] Dış ağ isteği sıfır
- [x] İlk açılış 30 KB gzip (hedef 300 KB altı)
- [x] GitHub Actions ile Pages yayını (ilk çalıştırma başarılı, 28 sn)
- [x] main'e merge: site 309162f, içerik 241acac

## Bilinen eksikler / sonraki adım
- Hücre başına 2 varyant/ton (hedef 4). Aşama 3'te içerik derinleştirme.
- Kasa (şifreli kayıt) ve "iz bırakma" modu henüz yok; Aşama 5.
- Kahve, tarot vb. ana sayfada "yakında".
- Kullanıcının yapması gereken: siteyi tarayıcıdan açıp kontrol etmek (bu oturumun ağı github.io'ya erişemiyor); Dependabot'un bildirdiği 1 düşük seviyeli uyarıya bakmak.
