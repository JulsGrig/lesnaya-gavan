// Единый источник данных о домах
export const HOUSES = [
  { id: 'h1', name: 'Дом «Сосна»',   desc: 'Уютный домик у самого леса.',            capacity: 2, pricePerNight: 4500,  x: 18, y: 30 },
  { id: 'h2', name: 'Дом «Берёза»',  desc: 'Светлый дом с террасой.',                capacity: 4, pricePerNight: 6800,  x: 40, y: 26 },
  { id: 'h3', name: 'Дом «Дуб»',     desc: 'Просторный дом для большой компании.',   capacity: 8, pricePerNight: 12000, x: 62, y: 22 },
  { id: 'h4', name: 'Дом «Ольха»',   desc: 'Компактный дом с камином.',              capacity: 3, pricePerNight: 5200,  x: 15, y: 52 },
  { id: 'h5', name: 'Дом «Клён»',    desc: 'Дом у озера с видом на воду.',           capacity: 5, pricePerNight: 8900,  x: 78, y: 50 },
  { id: 'h6', name: 'Дом «Рябина»',  desc: 'Тёплый дом для семьи.',                  capacity: 4, pricePerNight: 7100,  x: 48, y: 48 },
  { id: 'h7', name: 'Дом «Черёмуха»',desc: 'Дом с большой верандой.',                capacity: 6, pricePerNight: 9800,  x: 30, y: 78 },
  { id: 'h8', name: 'Дом «Ива»',     desc: 'Уединённый дом в глубине посёлка.',      capacity: 4, pricePerNight: 6500,  x: 66, y: 82 },
];

// Изначально занятые дома (сбрасываются при «Сбросить демо»)
export const INITIAL_BUSY = ['h3', 'h7'];