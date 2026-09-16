// Minimal line-icon set (stroke-based, 24x24 viewBox, currentColor).
// Replaces all emoji in the app with a consistent, modern icon system.

const PATHS = {
  plane: `<polygon points="22 2 15 22 11 13 2 9 22 2"/><line x1="22" y1="2" x2="11" y2="13"/>`,
  car: `<path d="M3 13l1.5-5A2 2 0 0 1 6.4 6.5h11.2A2 2 0 0 1 19.5 8l1.5 5"/><rect x="2" y="13" width="20" height="5" rx="1.5"/><circle cx="7" cy="18.5" r="1.5"/><circle cx="17" cy="18.5" r="1.5"/>`,
  drone: `<rect x="9" y="9" width="6" height="6" rx="1.2"/><line x1="9" y1="9" x2="4" y2="4"/><line x1="15" y1="9" x2="20" y2="4"/><line x1="9" y1="15" x2="4" y2="20"/><line x1="15" y1="15" x2="20" y2="20"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/>`,
  ban: `<circle cx="12" cy="12" r="9"/><line x1="5.5" y1="5.5" x2="18.5" y2="18.5"/>`,
  camera: `<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8 7l1.4-2.4h5.2L16 7"/><circle cx="12" cy="13.5" r="3.4"/>`,
  food: `<line x1="7" y1="2" x2="7" y2="22"/><line x1="4" y1="2" x2="4" y2="9"/><line x1="10" y1="2" x2="10" y2="9"/><path d="M17 2c-2.2 0-3.2 2-3.2 5s1 4 3.2 4v11"/>`,
  home: `<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/>`,
  boat: `<path d="M3 15h18l-2.2 5H5.2Z"/><path d="M12 2v11"/><path d="M12 4.2 18 9H8Z"/>`,
  hike: `<path d="M3 20 10 8l3.5 6L15.5 11 21 20Z"/><circle cx="7.6" cy="5.6" r="1.6"/>`,
  sunset: `<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/>`,
  waves: `<path d="M2 14.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>`,
  moon: `<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>`,
  bag: `<path d="M6 8h12l-1 12H7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>`,
  document: `<path d="M6 2h9l5 5v15H6Z"/><path d="M15 2v5h5"/><line x1="9" y1="13" x2="16" y2="13"/><line x1="9" y1="17" x2="16" y2="17"/>`,
  briefcase: `<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/>`,
  battery: `<rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="10" x2="22" y2="14"/><rect x="4.5" y="9.5" width="7" height="5" fill="currentColor" stroke="none"/>`,
  "check-circle": `<circle cx="12" cy="12" r="9"/><path d="M7.5 12.5 10 15l6.5-6.5"/>`,
  sparkle: `<path d="M12 2 13.9 8.1 20 10 13.9 11.9 12 18 10.1 11.9 4 10 10.1 8.1Z"/>`,
  compass: `<circle cx="12" cy="12" r="9"/><path d="M15.3 8.7 13 13l-4.3 2.3L11 11Z"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 3.2"/>`,
  pin: `<path d="M12 22s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.4"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>`,
  transit: `<circle cx="12" cy="12" r="9"/><path d="M8 12h8M13 8.2 17 12l-4 3.8"/>`,
  x: `<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>`,
};

function icon(name, opts = {}) {
  const inner = PATHS[name];
  if (!inner) return '';
  const size = opts.size || 16;
  const cls = opts.class ? ` ${opts.class}` : '';
  return `<svg class="icon${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// Static content -> icon lookups (kept here so views stay declarative)
const DAY_ICON = { 1: 'moon', 2: 'camera', 3: 'boat', 4: 'sunset', 5: 'waves', 6: 'hike', 7: 'plane' };
const TYPE_ICON = { transport: 'transit', food: 'food', hotel: 'home', activity: 'sparkle' };
const CATEGORY_ICON = { documento: 'document', reserva_restaurante: 'food', reserva_tour: 'compass', logistica: 'briefcase', compra: 'bag', equipo: 'battery', tarea: 'sparkle' };
const CATEGORY_LABEL = { documento: 'Documento', reserva_restaurante: 'Restaurante', reserva_tour: 'Experiencia', logistica: 'Logística', compra: 'Compra', equipo: 'Equipo', tarea: 'Tarea' };
const STATUS_ICON = { upcoming: 'clock', past: 'check-circle', planned: 'sparkle' };
const STATUS_LABEL = { upcoming: 'Próximo', past: 'Visitado', planned: 'Soñando' };

module.exports = { icon, DAY_ICON, TYPE_ICON, CATEGORY_ICON, CATEGORY_LABEL, STATUS_ICON, STATUS_LABEL };
