import { state, persist, isBusy, getHouse, nextNumber, resetDemo } from './state.js';
import {
  renderMapAndList, renderCard, renderBookings, showSaveError
} from './render.js';

export function selectHouse(id) {
  const house = getHouse(id);
  if (!house || isBusy(id)) return;
  state.selectedId = id;
  renderMapAndList();
  renderCard();
}

export function clearSelection() {
  state.selectedId = null;
  renderMapAndList();
  renderCard();
}

export function validateForm(house, guestsRaw, nightsRaw) {
  const errors = { guests: '', nights: '' };
  const guests = Number(guestsRaw);
  const nights = Number(nightsRaw);

  if (!Number.isInteger(guests) || guests < 1 || guests > house.capacity) {
    errors.guests = `Введите целое число от 1 до ${house.capacity}.`;
  }
  if (!Number.isInteger(nights) || nights < 1 || nights > 30) {
    errors.nights = 'Введите целое число от 1 до 30.';
  }
  return { errors, guests, nights };
}

export function confirmBooking(house, guests, nights) {
  if (state.submitting) return { ok: false, reason: 'busy' };
  if (isBusy(house.id)) return { ok: false, reason: 'busy-house' };

  state.submitting = true;
  try {
    const booking = {
      id: 'b_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      number: nextNumber(),
      houseId: house.id,
      houseName: house.name,
      guests,
      nights,
      sum: house.pricePerNight * nights,
    };
    state.bookings.unshift(booking);
    state.busyIds.add(house.id);
    state.selectedId = null;

    const saved = persist();
    if (!saved) showSaveError();

    renderMapAndList();
    renderCard();
    renderBookings();
    return { ok: true, booking };
  } finally {
    state.submitting = false;
  }
}

export function cancelBooking(bookingId) {
  const idx = state.bookings.findIndex(b => b.id === bookingId);
  if (idx === -1) return;
  const booking = state.bookings[idx];
  state.bookings.splice(idx, 1);
  state.busyIds.delete(booking.houseId);
  if (state.selectedId === booking.houseId) state.selectedId = null;

  const saved = persist();
  if (!saved) showSaveError();

  renderMapAndList();
  renderCard();
  renderBookings();
}

export function handleResetDemo() {
  if (!confirm('Сбросить демо: удалить все брони и освободить дома?')) return;
  resetDemo();
  renderMapAndList();
  renderCard();
  renderBookings();
}