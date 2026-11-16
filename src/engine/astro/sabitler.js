// Astroloji sabitleri: burçlar, gezegenler, yönetimler, açılar.

export const BURCLAR = [
  { key: 'koc', ad: 'Koç', element: 'ates', nitelik: 'oncu', yonetici: 'mars', sembol: '♈' },
  { key: 'boga', ad: 'Boğa', element: 'toprak', nitelik: 'sabit', yonetici: 'venus', sembol: '♉' },
  { key: 'ikizler', ad: 'İkizler', element: 'hava', nitelik: 'degisken', yonetici: 'merkur', sembol: '♊' },
  { key: 'yengec', ad: 'Yengeç', element: 'su', nitelik: 'oncu', yonetici: 'ay', sembol: '♋' },
  { key: 'aslan', ad: 'Aslan', element: 'ates', nitelik: 'sabit', yonetici: 'gunes', sembol: '♌' },
  { key: 'basak', ad: 'Başak', element: 'toprak', nitelik: 'degisken', yonetici: 'merkur', sembol: '♍' },
  { key: 'terazi', ad: 'Terazi', element: 'hava', nitelik: 'oncu', yonetici: 'venus', sembol: '♎' },
  { key: 'akrep', ad: 'Akrep', element: 'su', nitelik: 'sabit', yonetici: 'mars', modernYonetici: 'pluton', sembol: '♏' },
  { key: 'yay', ad: 'Yay', element: 'ates', nitelik: 'degisken', yonetici: 'jupiter', sembol: '♐' },
  { key: 'oglak', ad: 'Oğlak', element: 'toprak', nitelik: 'oncu', yonetici: 'saturn', sembol: '♑' },
  { key: 'kova', ad: 'Kova', element: 'hava', nitelik: 'sabit', yonetici: 'saturn', modernYonetici: 'uranus', sembol: '♒' },
  { key: 'balik', ad: 'Balık', element: 'su', nitelik: 'degisken', yonetici: 'jupiter', modernYonetici: 'neptun', sembol: '♓' },
];

// swe kimlikleri: Sun 0, Moon 1, Mercury 2, Venus 3, Mars 4, Jupiter 5, Saturn 6, Uranus 7, Neptune 8, Pluto 9,
// TrueNode 11, MeanApogee (Kara Ay) 12
export const GEZEGENLER = [
  { key: 'gunes', ad: 'Güneş', swe: 0, sembol: '☉', tur: 'isik', orb: 10, astrochart: 'Sun' },
  { key: 'ay', ad: 'Ay', swe: 1, sembol: '☽', tur: 'isik', orb: 10, astrochart: 'Moon' },
  { key: 'merkur', ad: 'Merkür', swe: 2, sembol: '☿', tur: 'kisisel', orb: 7, astrochart: 'Mercury' },
  { key: 'venus', ad: 'Venüs', swe: 3, sembol: '♀', tur: 'kisisel', orb: 7, astrochart: 'Venus' },
  { key: 'mars', ad: 'Mars', swe: 4, sembol: '♂', tur: 'kisisel', orb: 7, astrochart: 'Mars' },
  { key: 'jupiter', ad: 'Jüpiter', swe: 5, sembol: '♃', tur: 'sosyal', orb: 6, astrochart: 'Jupiter' },
  { key: 'saturn', ad: 'Satürn', swe: 6, sembol: '♄', tur: 'sosyal', orb: 6, astrochart: 'Saturn' },
  { key: 'uranus', ad: 'Uranüs', swe: 7, sembol: '♅', tur: 'kusak', orb: 5, astrochart: 'Uranus' },
  { key: 'neptun', ad: 'Neptün', swe: 8, sembol: '♆', tur: 'kusak', orb: 5, astrochart: 'Neptune' },
  { key: 'pluton', ad: 'Plüton', swe: 9, sembol: '♇', tur: 'kusak', orb: 5, astrochart: 'Pluto' },
  { key: 'dugum', ad: 'Kuzey Ay Düğümü', swe: 11, sembol: '☊', tur: 'nokta', orb: 3, astrochart: 'NNode' },
  { key: 'lilith', ad: 'Kara Ay (Lilith)', swe: 12, sembol: '⚸', tur: 'nokta', orb: 3, astrochart: 'Lilith' },
];
export const GEZEGEN = Object.fromEntries(GEZEGENLER.map((g) => [g.key, g]));

// Geleneksel onur ve zaaf tablosu
export const ONUR = {
  gunes: { ev: ['aslan'], yucelim: 'koc', zarar: ['kova'], dusus: 'terazi' },
  ay: { ev: ['yengec'], yucelim: 'boga', zarar: ['oglak'], dusus: 'akrep' },
  merkur: { ev: ['ikizler', 'basak'], yucelim: 'basak', zarar: ['yay', 'balik'], dusus: 'balik' },
  venus: { ev: ['boga', 'terazi'], yucelim: 'balik', zarar: ['akrep', 'koc'], dusus: 'basak' },
  mars: { ev: ['koc', 'akrep'], yucelim: 'oglak', zarar: ['terazi', 'boga'], dusus: 'yengec' },
  jupiter: { ev: ['yay', 'balik'], yucelim: 'yengec', zarar: ['ikizler', 'basak'], dusus: 'oglak' },
  saturn: { ev: ['oglak', 'kova'], yucelim: 'terazi', zarar: ['yengec', 'aslan'], dusus: 'koc' },
  uranus: { ev: ['kova'], yucelim: null, zarar: ['aslan'], dusus: null },
  neptun: { ev: ['balik'], yucelim: null, zarar: ['basak'], dusus: null },
  pluton: { ev: ['akrep'], yucelim: null, zarar: ['boga'], dusus: null },
};

export const ACILAR = [
  { key: 'kavusum', ad: 'kavuşum', aci: 0, orbCarpan: 1, sembol: '☌', dogasi: 'guclu' },
  { key: 'karsit', ad: 'karşıt', aci: 180, orbCarpan: 1, sembol: '☍', dogasi: 'gergin' },
  { key: 'ucgen', ad: 'üçgen', aci: 120, orbCarpan: 0.9, sembol: '△', dogasi: 'akici' },
  { key: 'kare', ad: 'kare', aci: 90, orbCarpan: 0.9, sembol: '□', dogasi: 'gergin' },
  { key: 'altigen', ad: 'altıgen', aci: 60, orbCarpan: 0.65, sembol: '⚹', dogasi: 'akici' },
  { key: 'quincunx', ad: 'quincunx', aci: 150, orbCarpan: 0.4, sembol: '⚻', dogasi: 'ayar' },
];

export const ELEMENT_ADI = { ates: 'Ateş', toprak: 'Toprak', hava: 'Hava', su: 'Su' };
export const NITELIK_ADI = { oncu: 'Öncü', sabit: 'Sabit', degisken: 'Değişken' };

export const EV_ADI = ['', '1. ev', '2. ev', '3. ev', '4. ev', '5. ev', '6. ev', '7. ev', '8. ev', '9. ev', '10. ev', '11. ev', '12. ev'];

export function norm360(x) { return ((x % 360) + 360) % 360; }
export function burcIndeksi(lon) { return Math.floor(norm360(lon) / 30); }
export function burc(lon) { return BURCLAR[burcIndeksi(lon)]; }
export function derece(lon) {
  const d = norm360(lon) % 30;
  const deg = Math.floor(d);
  const min = Math.floor((d - deg) * 60);
  return { deg, min, yazi: `${deg}°${String(min).padStart(2, '0')}′` };
}
export function konumYazi(lon) { return `${derece(lon).yazi} ${burc(lon).ad}`; }
/** İki boylam arasındaki en kısa açı (0-180). */
export function fark(a, b) { const d = Math.abs(norm360(a) - norm360(b)); return d > 180 ? 360 - d : d; }
