# Görev: tamamla (Aşama 2–5)

Dal: `gorev/tamamla` (site ve `esoterica-kutuphane`). main'e merge edilmedi, onay bekliyor.

## Yapılanlar

### Aşama 2–3: Doğum haritası ve günlük gökyüzü
- Swiss Ephemeris WASM (Moshier) ile gezegen, ev, Ay düğümü ve Lilith hesabı; Placidus, Koch, eşit ve burç ev sistemleri. Kutup bölgesinde (≥66°) burç evine düşer.
- Saat dilimi tarayıcının IANA veritabanıyla; yaz saati boşluğu ve belirsiz saat ayrıca soruluyor.
- 25 846 şehir (Türkiye'nin tüm yerleşimleri + dünyada 15 000 nüfus üstü), derleme anında; ilk açılışa dahil değil.
- 220 altın testle pyswisseph'e karşı doğrulandı (gezegen 1″, ev 1′).
- Harita yorumu: üçlü, element/nitelik dengesi, baskınlık, kalıplar (stelyum, T-kare, büyük üçgen, yod, büyük haç), açılar, aşk/kariyer/para bölümleri. 791 içerik metni.
- Günlük ekran: Ay evresi ve burcu, retrolar, kişisel transitler (harita varsa), dört alan, sonraki dolunay ve yeni ay, telefon takvimine `.ics` hatırlatma.

### Aşama 4: Diğer fallar
| Fal | Rota | İçerik |
|---|---|---|
| Tarot | `#/tarot` | 78 kart, düz/ters, 6 açılım (tek kart → Kelt haçı), genel/aşk/iş |
| Lenormand | `#/lenormand` | 36 kart, ikili okuma, 3/5/9 kart |
| Rün | `#/run` | Yaşlı Futhark 24 + boş rün; simetrik rünler ters okunmaz |
| İskambil | `#/iskambil` | 52 kart, katina yedili açılım |
| I Ching | `#/iching` | 64 heksagram, 8 üçlü, üç para ve civanperçemi olasılıkları, dönüşen heksagram |
| Kahve falı | `#/kahve` | 119 sembol, 6 bölge (sap, karşı, kenar, orta, dip, tabak) |
| Rüya tabiri | `#/ruya` | 123 sembol; serbest metinden sembol bulma (Türkçe ekler), gelenek + psikolojik okuma, duygu |
| Adın ve sayıların | `#/sayilar` | Pisagor numerolojisi (usta sayılar), yıldızname (ebced, yöntem açıkça yazılı), Çin burcu (Çin takvimi) ve uyum |

- Çekimler `crypto.getRandomValues`; kullanıcı kartları ters destenin içinden kendisi seçiyor.
- Kahve falında fotoğraf yok: kullanıcı gördüğü şekli ve yerini seçiyor; görüntü işlenmiyor.
- Her modül ve içeriği tembel yükleniyor. İlk açılış: JS 35 KB + CSS 3 KB (gzip).

### Aşama 5: Gizlilik, kasa, lisanslar
- Varsayılan iz bırakmaz: bilgiler yalnızca sekmenin belleğinde.
- İsteğe bağlı şifreli kasa: PBKDF2-SHA256 (310 000 yineleme) + AES-GCM 256, IndexedDB. Anahtar dışa aktarılamaz, parola saklanmaz.
- "Her şeyi sil": IndexedDB, önbellekler, service worker, yerel depolama.
- Gizlilik sayfasında üçüncü taraf lisans listesi (GeoNames CC BY 4.0 atfı dahil).
- Kullanılmayan `motion` bağımlılığı kaldırıldı.

## Testler
150/150 (vitest). Uçtan uca başsız Chrome denemesi: tarot, rün, Lenormand 3×3, I Ching, kahve, rüya, sayılar, kasa kur → harita gir → yeniden yükle → yanlış parola reddi → doğru parola → her şeyi sil. Konsol hatası yok; ağ isteği yalnızca kendi kökene. IndexedDB kaydında düz metin yok.

## Bilinen sınırlar
- IANA'nın 1970 öncesi birleştirilmiş bölgeleri (ör. Europe/Oslo, Atlantic/Reykjavik) bazı eski tarihlerde yerel saat farkı verebilir. Testlerde ayrı işaretli, oranı %3 altında.
- I Ching'de 384 çizgi metni yok; değişen çizgiler konumlarına göre genel okunuyor.
- Rüya ve kahve sözlükleri ~120'şer sembol. Genişletme yalnızca içerik reposuna YAML ekleyerek yapılır.
- Dependabot: `deepmerge` (yalnızca geliştirme bağımlılığı, düşük önem, düzeltme yok). Üretim bağımlılıklarında açık yok.
- Bu oturum github.io'ya erişemediği için canlı site doğrulanmadı.

## Merge sırası (onaydan sonra)
1. `esoterica-kutuphane`: `gorev/tamamla` → `main`.
2. Site: alt modül işaretçisini kütüphane main'ine güncelle, `gorev/tamamla` → `main`.
3. Actions yayınını ve canlı siteyi kontrol et.
