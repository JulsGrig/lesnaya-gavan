import { initState, state, getFilteredHouses } from './state.js';
import {
  renderMapAndList, renderCard, renderBookings,
  setSelectHandler, showFilterMessage
} from './render.js';
import {
  selectHouse, validateForm, confirmBooking,
  cancelBooking, handleResetDemo
} from './booking.js';

// ----- Защита: проверяем, что ключевые элементы есть и данные валидны -----
const REQUIRED = ['map', 'houseList', 'card', 'bookingsList'];
const missing = REQUIRED.filter(id => !document.getElementById(id));
if (missing.length) {
  console.error('Не найдены элементы:', missing);
} else if (!Array.isArray(state.houses) || state.houses.length === 0) {
  console.error('Массив домов пуст. Проверьте js/data.js');
} else {
  boot();
}

function boot() {
  // 1) Инициализация состояния (localStorage)
  initState();
  if (state.loadError) showFilterMessage(state.loadError);

  // 2) Рендер
  setSelectHandler(selectHouse);
  renderMapAndList();
  renderCard();
  renderBookings();

  // 3) Фильтры
  const guestsEl = document.getElementById('filterGuests');
  const priceEl  = document.getElementById('filterPrice');
  const resetFiltersBtn = document.getElementById('resetFilters');

  function applyFilters() {
    const g = Number(guestsEl.value);
    const p = Number(priceEl.value);
    state.filters.guestsMin = Number.isFinite(g) && g >= 1 ? Math.floor(g) : 1;
    state.filters.priceMax  = Number.isFinite(p) && p >= 0 ? p : Infinity;

    const filtered = getFilteredHouses();
    const visibleIds = new Set(filtered.map(h => h.id));

    if (state.selectedId && !visibleIds.has(state.selectedId)) {
      state.selectedId = null;
      showFilterMessage('Выбранный дом скрыт фильтрами — выбор сброшен.');
    } else {
      showFilterMessage('');
    }

    renderMapAndList();
    renderCard();
  }

  guestsEl.addEventListener('input', applyFilters);
  priceEl.addEventListener('input', applyFilters);
  resetFiltersBtn.addEventListener('click', () => {
    guestsEl.value = 1;
    priceEl.value = 20000;
    applyFilters();
  });

  // 4) Форма бронирования — слушаем кастомное событие из renderCard
  document.addEventListener('bookingFormReady', (e) => {
    const house = e.detail.house;
    const form     = document.getElementById('bookingForm');
    const guests   = document.getElementById('guestsInput');
    const nights   = document.getElementById('nightsInput');
    const guestsErr = document.getElementById('guestsError');
    const nightsErr = document.getElementById('nightsError');
    const formErr  = document.getElementById('formError');
    const confirmBtn = document.getElementById('confirmBtn');
    if (!form) return;

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      guestsErr.textContent = '';
      nightsErr.textContent = '';
      formErr.textContent = '';

      const { errors, guests: g, nights: n } =
        validateForm(house, guests.value, nights.value);
      if (errors.guests) guestsErr.textContent = errors.guests;
      if (errors.nights) nightsErr.textContent = errors.nights;
      if (errors.guests || errors.nights) return;

      confirmBtn.disabled = true;
      const res = confirmBooking(house, g, n);
      if (!res.ok) {
        formErr.textContent = res.reason === 'busy-house'
          ? 'Этот дом уже занят. Выберите другой.'
          : 'Не удалось подтвердить бронь, попробуйте ещё раз.';
        confirmBtn.disabled = false;
      }
    });
  });

  // 5) Отмена брони
  document.getElementById('bookingsList').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-cancel]');
    if (!btn) return;
    cancelBooking(btn.dataset.cancel);
  });

  // 6) Сброс демо
  document.getElementById('resetDemo').addEventListener('click', handleResetDemo);
}