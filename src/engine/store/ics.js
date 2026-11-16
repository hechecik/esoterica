// Takvim hatırlatıcısı (.ics): cihazda üretilir, sunucu ya da bildirim izni gerektirmez.
// Dosyada kişisel veri yok: yalnızca saat ve sitenin adresi.

const SITE = 'https://hechecik.github.io/esoterica/#/gunluk';

function damga(d) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** @param {string} saat "08:30" yerel saat */
export function gunlukIcs(saat = '08:30', bugun = new Date()) {
  const [h, m] = saat.split(':').map(Number);
  const y = bugun.getFullYear(), ay = String(bugun.getMonth() + 1).padStart(2, '0'), g = String(bugun.getDate()).padStart(2, '0');
  const bas = `${y}${ay}${g}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
  const uid = `esoterica-gunluk-${bas}@hechecik.github.io`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Esoterica//TR', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${damga(bugun)}`,
    `DTSTART:${bas}`,
    'DURATION:PT5M',
    'RRULE:FREQ=DAILY',
    'SUMMARY:Günün göğü',
    `DESCRIPTION:Bugünün falı hazır. ${SITE}`,
    `URL:${SITE}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Günün göğü', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}
