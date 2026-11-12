import { state, isBusy, getFilteredHouses } from './state.js';

const mapEl = document.getElementById('map');
const listEl = document.getElementById('houseList');
const listEmptyEl = document.getElementById('listEmpty');
const cardEl = document.getElementById('card');
const bookingsListEl = document.getElementById('bookingsList');
const bookingsEmptyEl = document.getElementById('bookingsEmpty');
const filterMessageEl = document.getElementById('filterMessage');

let onSelectCallback = () => {};
export function setSelectHandler(fn) { onSelectCallback = fn; }

function statusLabel(house) {
  if (isBusy(house.id)) return 'занят';
  if (state.selectedId === house.id) return 'выбран';
  return 'свободен';
}

function makeMapButton(house) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'house-btn';
  btn.dataset.id = house.id;
  btn.style.left = house.x + '%';
  btn.style.top = house.y + '%';
  btn.setAttribute('aria-label', `${house.name}, ${statusLabel(house)}`);

  const icon = document.createElement('span');
  icon.className = 'house-btn__icon';
  icon.textContent = isBusy(house.id) ? '🚫' : '🏠';

  const name = document.createElement('span');
  name.textContent = house.name.replace('Дом ', '');

  const status = document.createElement('span');
  status.className = 'house-btn__status';
  status.textContent = statusLabel(house);

  btn.append(icon, name, status);

  if (isBusy(house.id)) {
    btn.classList.add('house-btn--busy');
    btn.disabled = true;
  } else if (state.selectedId === house.id) {
    btn.classList.add('house-btn--selected');
  }

  btn.addEventListener('click', () => onSelectCallback(house.id));
  return btn;
}

function makeListItem(house) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'house-item';
  btn.setAttribute('aria-label',
    `${house.name}, ${statusLabel(house)}, ${house.pricePerNight} ₽ за ночь`);

  if (isBusy(house.id)) {
    btn.classList.add('house-item--busy');
    btn.disabled = true;
  } else if (state.selectedId === house.id) {
    btn.classList.add('house-item--selected');
  }

  btn.innerHTML = `
    <div class="house-item__row">
      <strong>${house.name}</strong>
      <span class="house-item__status">${statusLabel(house)}</span>
    </div>
    <div>До ${house.capacity} гостей</div>
    <div>${house.pricePerNight.toLocaleString('ru-RU')} ₽ / ночь</div>
  `;

  btn.addEventListener('click', () => onSelectCallback(house.id));
  li.appendChild(btn);
  return li;
}

export function renderMapAndList() {
  const filtered = getFilteredHouses();
  const filteredIds = new Set(filtered.map(h => h.id));

  mapEl.querySelectorAll('.house-btn').forEach(el => el.remove());
  state.houses.forEach(h => {
    const btn = makeMapButton(h);
    if (!filteredIds.has(h.id)) btn.classList.add('house-btn--hidden');
    mapEl.appendChild(btn);
  });

  listEl.innerHTML = '';
  filtered.forEach(h => listEl.appendChild(makeListItem(h)));
  listEmptyEl.hidden = filtered.length > 0;
}

export function renderCard() {
  const house = state.selectedId
    ? state.houses.find(h => h.id === state.selectedId)
    : null;

  if (!house) {
    cardEl.className = 'card card--empty';
    cardEl.innerHTML = '<p>Выберите дом на схеме или в списке ниже.</p>';
    return;
  }

  cardEl.className = 'card';
  cardEl.innerHTML = `
    <h3>${house.name}</h3>
    <p class="card__meta">До ${house.capacity} гостей · ${house.pricePerNight.toLocaleString('ru-RU')} ₽ / ночь</p>
    <p class="card__desc">${house.desc}</p>

    <form id="bookingForm" novalidate>
      <div class="form-field">
        <label for="guestsInput">Гостей (1–${house.capacity})</label>
        <input id="guestsInput" type="number" min="1" max="${house.capacity}" step="1" value="1" required />
        <p class="form-error" id="guestsError"></p>
      </div>
      <div class="form-field">
        <label for="nightsInput">Ночей (1–30)</label>
        <input id="nightsInput" type="number" min="1" max="30" step="1" value="1" required />
        <p class="form-error" id="nightsError"></p>
      </div>

      <div class="total">
        <span>Итого</span>
        <span class="total__value" id="totalValue">0 ₽</span>
      </div>

      <button type="submit" class="btn" id="confirmBtn">Подтвердить бронь</button>
      <p class="form-error" id="formError"></p>
    </form>
  `;

  const form   = cardEl.querySelector('#bookingForm');
  const guests = cardEl.querySelector('#guestsInput');
  const nights = cardEl.querySelector('#nightsInput');
  const totalEl = cardEl.querySelector('#totalValue');

  const updateTotal = () => {
    const g = Number(guests.value);
    const n = Number(nights.value);
    const okG = Number.isInteger(g) && g >= 1 && g <= house.capacity;
    const okN = Number.isInteger(n) && n >= 1 && n <= 30;
    totalEl.textContent = (okG && okN)
      ? (house.pricePerNight * n).toLocaleString('ru-RU') + ' ₽'
      : '—';
  };
  guests.addEventListener('input', updateTotal);
  nights.addEventListener('input', updateTotal);
  updateTotal();

  // Сообщаем main.js, что форма готова — там навешивается submit
  document.dispatchEvent(new CustomEvent('bookingFormReady', { detail: { house } }));
}

export function renderBookings() {
  bookingsListEl.innerHTML = '';
  bookingsEmptyEl.hidden = state.bookings.length > 0;

  state.bookings.forEach(b => {
    const li = document.createElement('li');
    li.className = 'booking';
    li.innerHTML = `
      <div class="booking__info">
        <span class="booking__num">Бронь №${b.number}</span>
        <strong>${b.houseName}</strong>
        <span>${b.guests} гост. · ${b.nights} ноч. · <span class="booking__sum">${b.sum.toLocaleString('ru-RU')} ₽</span></span>
      </div>
      <button type="button" class="btn btn--danger" data-cancel="${b.id}">Отменить</button>
    `;
    bookingsListEl.appendChild(li);
  });
}

export function showFilterMessage(text) {
  filterMessageEl.textContent = text || '';
}

export function showSaveError() {
  const msg = document.createElement('p');
  msg.className = 'filter-message';
  msg.textContent = 'Не удалось сохранить данные в браузере — бронь хранится только до перезагрузки.';
  filterMessageEl.appendChild(msg);
  setTimeout(() => msg.remove(), 6000);
}