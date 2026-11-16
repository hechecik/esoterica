# Görev: teslim

Dal: `gorev/teslim` (site ve `esoterica-kutuphane`). main'e merge edilmedi, onay bekliyor.

## Tamamlanan eksikler
- **I Ching:** 64 heksagramın 384 çizgi sözü yazıldı (özgün Türkçe yorum, çeviri değil). Değişen her çizgide önce heksagrama özgü söz, sonra konumun genel anlamı gösteriliyor.
- **Kahve falı:** sözlük 119 → 261 sembol (hayvan, insan, nesne, doğa, yapı, yol, şekil).
- **Rüya tabiri:** sözlük 123 → 260 sembol. Serbest metinde en uzun eşleşme kazanıyor ("ayı" artık "ay" sanılmıyor), sembolün kendi adı eş anlamlıdan önce geliyor.
- **Tarot:** 56 küçük arkana kartının her birine ayrı aşk, iş ve öğüt metni.
- **İskambil:** 52 kartın her birine ayrı yorum.
- Derleyici yeni dosyaları birleştirip alt sınırları denetliyor (I Ching 64×6, kahve/rüya ≥240, küçük arkana ve iskambil eksiksiz).

## Kart tasarımları (özgün SVG, görsel dosyası yok)
- **Tarot:** lacivert zemin, altın çizgi gravür; 22 büyük arkananın her biri için ayrı amblem; küçük arkanada takım renkli pip düzenleri (asa kehribar, kupa deniz yeşili, kılıç gümüş mavi, tılsım yeşil altın); saray kartlarında tüy, miğfer, taç işaretleri. Ters gelen kart gerçekten ters duruyor.
- **Lenormand:** krem kâğıt, mürekkep çizgi ikonlar; geleneksel iskambil köşe işaretleri (Atlı 9♥ … Haç 6♣).
- **İskambil:** klasik pip düzeni, iki köşede indeks, saray kartlarında çerçeve ve taç.
- **Rün:** taş üstüne oyma etkili SVG çizim (yazı tipine bağımlı değil, her cihazda aynı).
- **Arka yüzler:** deste başına ayrı desen (tarot ışınlı madalyon, Lenormand bordo kafes, iskambil lacivert kafes, rün taş).
- **Yeni: Desteyi tanı** (`#/deste/tarot|lenormand|run|iskambil`): bütün kartlar ızgarada, dokununca anlamı.
- **Yeni: Günün kartı** ana sayfada; aynı gün herkes için aynı kart, dokununca döner.

## Bulunan gerçek hata
- Kart falından başka bir modüle geçerken (ör. rün → I Ching) eski modül yeni yolla bir an kuruluyor ve `varsayilan` hatasıyla çöküyordu (canlıda da vardı). Tembel yüklenen bileşen artık yalnızca yüklendiği yolda gösteriliyor.

## Testler
156/156. Uçtan uca başsız Chrome: tarot, rün, Lenormand 3×3, I Ching, kahve, rüya, sayılar, deste galerisi, günün kartı, kasa akışı. Konsol hatası yok, istek yalnızca kendi kökene, derleme çıktısında dış URL yok. İlk açılış JS 44 KB gzip.

## Kalan sınırlar
- IANA 1970 öncesi birleştirilmiş bölgeler (önceki raporda).
- Dependabot: `deepmerge`, yalnızca geliştirme bağımlılığı, düşük önem.
