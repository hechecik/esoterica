# Esoterica

Remil, doğum haritası, tarot, kahve falı ve daha fazlası için Türkçe bir fal sitesi. Tamamen statik; her şey tarayıcıda hesaplanır ve yorumlanır. Hiçbir veri gönderilmez.

Site: https://hechecik.github.io/esoterica/

## İlkeler
- **Ücretsiz ve statik:** GitHub Pages, sunucu yok.
- **Falın sende kalır:** çalışma anında dış istek yok (CSP ile zorlanır), çerez yok, takip yok.
- **Derin ve tekrarsız:** yorumlar ayrı bir içerik kütüphanesinden ([esoterica-kutuphane](https://github.com/hechecik/esoterica-kutuphane)) tohumlu rastgelelikle derlenir.
- **Açık kaynak:** AGPL-3.0. İddiayı kodu okuyarak doğrulayabilirsin.

## Geliştirme
```
git clone --recurse-submodules https://github.com/hechecik/esoterica.git
cd esoterica && npm install
npm run dev
```
Diğer komutlar ve kurallar için `AGENTS.md`.

## Lisans
Kod: AGPL-3.0 (`LICENSE`). Yorum metinleri: CC BY-NC-SA 4.0 (içerik reposunda). Yazı tipleri: Cormorant Garamond ve IBM Plex Sans, SIL OFL (`public/fonts/`).
