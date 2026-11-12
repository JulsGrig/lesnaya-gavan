import { HOUSES, INITIAL_BUSY } from './data.js';
import { loadState, saveState, clearState } from './storage.js';

export const state = {
  houses: HOUSES,
  busyIds: new Set(INITIAL_BUSY),
  selectedId: null,
  bookings: [],
  filters: { guestsMin: 1, priceMax: 20000 },
  submitting: false,
};

let nextBookingNumber = 1;

export function initState() {
  const saved = loadState();
  if (saved && saved.error) {
    state.loadError = saved.error;
  } else if (saved) {
    state.bookings = saved.bookings || [];
    state.busyIds = new Set(saved.busyIds || []);
    nextBookingNumber = state.bookings.reduce(
      (m, b) => Math.max(m, Number(b.number) || 0), 0
    ) + 1;
  }
}

export function persist() {
  return saveState(state);
}

export function resetDemo() {
  state.busyIds = new Set(INITIAL_BUSY);
  state.bookings = [];
  state.selectedId = null;
  nextBookingNumber = 1;
  clearState();
}

export function nextNumber() {
  return nextBookingNumber++;
}

export function isBusy(id) {
  return state.busyIds.has(id);
}

export function getHouse(id) {
  return state.houses.find(h => h.id === id) || null;
}

export function getFilteredHouses() {
  const { guestsMin, priceMax } = state.filters;
  return state.houses.filter(h =>
    h.capacity >= guestsMin && h.pricePerNight <= priceMax
  );
}