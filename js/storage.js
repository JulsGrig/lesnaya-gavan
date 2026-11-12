const KEY = 'lesnayaGavan.booking.v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.bookings)) {
      throw new Error('Некорректные данные');
    }
    return parsed;
  } catch (e) {
    console.warn('Не удалось прочитать сохранения:', e);
    return { error: 'Сохранённые данные повреждены и были сброшены.' };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      bookings: state.bookings,
      busyIds: Array.from(state.busyIds),
    }));
    return true;
  } catch (e) {
    console.warn('Не удалось сохранить данные:', e);
    return false;
  }
}

export function clearState() {
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}