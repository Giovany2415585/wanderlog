const { pool } = require('./db');

async function seed() {
  // Check if already seeded
  const existing = await pool.query("SELECT id FROM trips WHERE name = 'Curazao 2025'");
  if (existing.rows.length > 0) {
    console.log('Already seeded, skipping...');
    return existing.rows[0].id;
  }

  // Insert trip
  const trip = await pool.query(`
    INSERT INTO trips (name, country, flag, start_date, end_date, status, description, cover_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id
  `, [
    'Curazao 2025', 'Curazao, Caribe', '🇨🇼',
    '2025-10-01', '2025-10-07', 'upcoming',
    '7 días en el Caribe holandés. Playas turquesa, roadtrip épico y drone en cada playa.',
    'https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=1200&q=85'
  ]);
  const tripId = trip.rows[0].id;

  // Days
  const daysData = [
    { n:1, date:'2025-10-01', title:'Llegada tranquila', subtitle:'Taxi · Pietermaai · Sin carro', icon:'🌙', car:false, drone:false },
    { n:2, date:'2025-10-02', title:'Willemstad histórica', subtitle:'Todo a pie · Fotos icónicas', icon:'📸', car:false, drone:false },
    { n:3, date:'2025-10-03', title:'Klein Curazao ⛵', subtitle:'Isla deshabitada · Barco todo el día', icon:'🌊', car:false, drone:true },
    { n:4, date:'2025-10-04', title:'Roadtrip oeste 🚗', subtitle:'Día 1 del carro · Kokomo · Piskado · Kenepa', icon:'🌅', car:true, drone:true },
    { n:5, date:'2025-10-05', title:'Playas del sur 🚗', subtitle:'Día 2 del carro · Cas Abao · Porto Mari', icon:'🤿', car:true, drone:true },
    { n:6, date:'2025-10-06', title:'Naturaleza salvaje 🚗', subtitle:'Día 3 del carro · Christoffel · Shete Boka', icon:'🥾', car:true, drone:false },
    { n:7, date:'2025-10-07', title:'Regreso ✈️', subtitle:'Check-out · Compras · Vuelo 6:15 PM', icon:'🏠', car:false, drone:false },
  ];

  const dayIds = {};
  for (const d of daysData) {
    const res = await pool.query(`
      INSERT INTO days (trip_id, day_number, date, title, subtitle, icon, has_car, drone_ok)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id
    `, [tripId, d.n, d.date, d.title, d.subtitle, d.icon, d.car, d.drone]);
    dayIds[d.n] = res.rows[0].id;
  }

  // Activities for each day
  const activitiesData = {
    1: [
      { time:'5:00 PM', title:'Llegada aeropuerto Hato ✈️', desc:'Inmigración, maletas y taxi al Airbnb (~$15-20 USD). Sin carro hoy.', icon:'✈️', type:'transport' },
      { time:'6:30 PM', title:'Check-in Airbnb · Pietermaai', desc:'Descargar maletas, refrescarse. Todo queda a pie.', icon:'🏠', type:'hotel' },
      { time:'7:30 PM', title:'Paseo nocturno Pietermaai 📸', desc:'Arquitectura colonial iluminada, murales. Primer contacto con la isla.', icon:'🌙', type:'activity' },
      { time:'8:30 PM', title:'Cena: Gouverneur de Rouville 🍽', desc:'Vista al Handelskade iluminado. Comida caribeña. ⚠️ Reservar antes del 20 Sep.', icon:'🍽', type:'food' },
    ],
    2: [
      { time:'9:00 AM', title:'Puente Reina Emma + Handelskade 📸', desc:'Foto icónica #1 de Curazao. Llegar antes de las 10 AM. Patrimonio UNESCO.', icon:'📸', type:'activity' },
      { time:'10:00 AM', title:'Letras CURAÇAO en Wilhelminaplein 📸', desc:'Foto obligatoria a metros del puente.', icon:'📸', type:'activity' },
      { time:'10:30 AM', title:'Floating Market + Fort Amsterdam', desc:'Mercado flotante venezolano único en el Caribe. Fortaleza del siglo XVIII.', icon:'🛶', type:'activity' },
      { time:'12:30 PM', title:'Almuerzo: Marshe Bieu', desc:'Mercado local. Stobá, keshi yena, pisca ku banana. Precio bajo.', icon:'🍽', type:'food' },
      { time:'2:30 PM', title:'Murales de Scharloo + Otrobanda 📸', desc:'Barrio artístico con murales enormes. Galería al aire libre.', icon:'🎨', type:'activity' },
      { time:'5:00 PM', title:'Atardecer Fort Nassau 🌅', desc:'Vista 360° de Willemstad. ⚠️ Reservar antes del 15 Sep.', icon:'🌅', type:'activity' },
    ],
    3: [
      { time:'6:30 AM', title:'Desayuno rápido y muelle', desc:'Salida temprana al punto de embarque.', icon:'☕', type:'activity' },
      { time:'7:30 AM', title:'Zarpe hacia Klein Curazao ⛵', desc:'Isla deshabitada a 10 km. Viaje ~2 horas. Ambiente festivo.', icon:'⛵', type:'transport' },
      { time:'9:30 AM', title:'Klein Curazao 📸 🚁', desc:'Playa blanca kilométrica, faro rosa, barco naufragado. Snorkel con tortugas. 🚁 DRONE OK.', icon:'🏝', type:'activity' },
      { time:'1:00 PM', title:'Almuerzo a bordo (incluido)', desc:'Incluido en el tour.', icon:'🍽', type:'food' },
      { time:'3:30 PM', title:'Regreso navegando al atardecer 🌅', desc:'El viaje de vuelta con el sol bajando es espectacular.', icon:'🌅', type:'transport' },
    ],
    4: [
      { time:'8:00 AM', title:'Recoger carro 🚗', desc:'Con anfitrión del Airbnb ($30/día). Parada flamingos Jan Kok — solo fotos, NO drone.', icon:'🚗', type:'transport' },
      { time:'9:30 AM', title:'Playa Kokomo 📸 🚁', desc:'El columpio viral de Curazao. Toma cenital drone = imagen épica. Entrada gratuita.', icon:'🏖', type:'activity' },
      { time:'11:00 AM', title:'Playa Piskado 🐢 📸 🚁', desc:'Tortugas nadando entre los botes de pescadores. Llevar snorkel.', icon:'🐢', type:'activity' },
      { time:'12:30 PM', title:'Almuerzo en Playa Lagun 🍽', desc:'Restaurante al borde del agua. Pescado fresco local.', icon:'🍽', type:'food' },
      { time:'2:00 PM', title:'Grote Knip (Kenepa Grandi) 📸 🚁', desc:'La playa más fotografiada de la isla. Acantilados, agua turquesa. Drone = mejor toma del viaje.', icon:'📸', type:'activity' },
      { time:'4:30 PM', title:'Kleine Knip — Atardecer 🌅 🚁', desc:'5 min de Grote Knip. Más íntima. Drone al atardecer sobre el agua.', icon:'🌅', type:'activity' },
      { time:'7:00 PM', title:"Cena: Jaanchie's Restaurant 🍽", desc:'Legendario en Westpunt. Comida típica curazoleña auténtica.', icon:'🍽', type:'food' },
    ],
    5: [
      { time:'9:00 AM', title:'Cas Abao 📸 🚁', desc:'Playa privada ($13 USD). Aguas cristalinas, mirador. Cerditos en la tarde.', icon:'🏖', type:'activity' },
      { time:'11:30 AM', title:'Porto Mari 🤿 🚁', desc:'Doble arrecife de coral. Vida marina a 2m de la orilla.', icon:'🤿', type:'activity' },
      { time:'1:30 PM', title:'Almuerzo en Porto Mari 🍽', desc:'Restaurante de playa.', icon:'🍽', type:'food' },
      { time:'3:30 PM', title:'Jan Thiel — Infinity Pool 🌅', desc:'Papagayo Beach Club. Último atardecer de playa del viaje.', icon:'🌅', type:'activity' },
      { time:'8:00 PM', title:'Cena: Kome Willemstad ⭐', desc:'El mejor restaurante de la isla. ⚠️ Reservar antes del 10 Sep — URGENTE.', icon:'⭐', type:'food' },
    ],
    6: [
      { time:'7:30 AM', title:'Parque Christoffel 🥾', desc:'Monte Christoffel (372m). Salir temprano. 1.5L agua + zapatos cerrados. 🚫 DRONE PROHIBIDO.', icon:'🥾', type:'activity' },
      { time:'10:30 AM', title:'Shete Boka — Boka Tabla 📸 🚁', desc:'Cueva donde las olas rompen en los acantilados. 🚁 DRONE OK en la costa.', icon:'🌊', type:'activity' },
      { time:'12:30 PM', title:'Almuerzo de regreso 🍽', desc:'Camino de vuelta hacia Willemstad.', icon:'🍽', type:'food' },
      { time:'2:30 PM', title:'Cuevas de Hato 🦇', desc:'Estalactitas, arte rupestre arawak. Guía en español. ~$15 USD.', icon:'🦇', type:'activity' },
      { time:'5:00 PM', title:'Devolver el carro', desc:'Fin del alquiler. Mañana taxi.', icon:'🚗', type:'transport' },
    ],
    7: [
      { time:'9:00 AM', title:'Desayuno + check-out Airbnb', desc:'Última mañana en la isla.', icon:'☕', type:'activity' },
      { time:'10:00 AM', title:'Compras en Punda 🛒', desc:'Blue Curaçao original, sal marina, artesanías.', icon:'🛒', type:'activity' },
      { time:'12:30 PM', title:'Último almuerzo en la isla 🍽', desc:'Disfrutar cada bocado.', icon:'🍽', type:'food' },
      { time:'3:00 PM', title:'Taxi al aeropuerto Hato 🚕', desc:'Llegar 3 horas antes. Pagar impuesto de salida (~$35-40 USD pp).', icon:'🚕', type:'transport' },
      { time:'6:15 PM', title:'Vuelo de regreso ✈️', desc:'Maleta llena de recuerdos.', icon:'✈️', type:'transport' },
    ]
  };

  for (const [dayNum, acts] of Object.entries(activitiesData)) {
    for (let i = 0; i < acts.length; i++) {
      const a = acts[i];
      await pool.query(`
        INSERT INTO activities (day_id, time, title, description, icon, type, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [dayIds[dayNum], a.time, a.title, a.desc, a.icon, a.type, i]);
    }
  }

  // Checklist items
  const checkItems = [
    // URGENTE
    { text:'Registrar drone — emails a CCAA y BTP', priority:'urgente', deadline:'Antes del 10 Sep', done:false },
    { text:'Reservar Kome Willemstad para Lunes 5 Oct', priority:'urgente', deadline:'Antes del 10 Sep', done:false },
    { text:'Reservar tour Klein Curazao (Miss Ann Boat Trips)', priority:'urgente', deadline:'Antes del 10 Sep', done:false },
    { text:'Verificar vigencia pasaportes (mín. 6 meses)', priority:'urgente', deadline:'Esta semana', done:true },
    { text:'Localizar carnet de vacuna fiebre amarilla', priority:'urgente', deadline:'Esta semana', done:false },
    { text:'Verificar licencia de conducir vigente', priority:'urgente', deadline:'Esta semana', done:true },
    // IMPORTANTE
    { text:'Reservar Fort Nassau para Viernes 2 Oct', priority:'importante', deadline:'Antes del 15 Sep', done:false },
    { text:'Reservar Gouverneur de Rouville para Jueves 1 Oct', priority:'importante', deadline:'Antes del 20 Sep', done:false },
    { text:'Confirmar carro con anfitrión Airbnb ($30/día Dom–Mar)', priority:'importante', deadline:'Antes del 15 Sep', done:false },
    { text:'Avisar al banco — activar tarjeta para uso internacional', priority:'importante', deadline:'Antes del 20 Sep', done:false },
    { text:'Contratar seguro médico de viaje', priority:'importante', deadline:'Antes del 20 Sep', done:false },
    { text:'Verificar si tiquetes incluyen impuesto de salida', priority:'importante', deadline:'Antes del 15 Sep', done:true },
    { text:'Conseguir $250–350 USD en efectivo', priority:'importante', deadline:'Antes del 28 Sep', done:false },
    { text:'Comprar protector solar FPS 50+', priority:'importante', deadline:'Antes del 25 Sep', done:false },
    { text:'Comprar zapatos cerrados para Monte Christoffel', priority:'importante', deadline:'Antes del 25 Sep', done:false },
    // NORMAL
    { text:'Llenar DI Card en dcsa.cw (1–7 días antes)', priority:'normal', deadline:'25–30 Sep', done:true },
    { text:'Imprimir tiquetes y reserva del Airbnb', priority:'normal', deadline:'30 Sep', done:false },
    { text:'Imprimir autorizaciones drone (CCAA y BTP)', priority:'normal', deadline:'Al recibirlas', done:false },
    { text:'Comprar bolso impermeable para el barco', priority:'normal', deadline:'Antes del 25 Sep', done:false },
    { text:'Comprar baterías extra para el drone (mín. 2)', priority:'normal', deadline:'Antes del 25 Sep', done:false },
    { text:'Comprar pastillas mareo Dramamine para el barco', priority:'normal', deadline:'Antes del 25 Sep', done:false },
    { text:'Comprar 5–6 trajes de baño, shorts y camisetas', priority:'normal', deadline:'Antes del 25 Sep', done:false },
    { text:'Preparar 2–3 outfits casuales-elegantes para cenar', priority:'normal', deadline:'Antes del 25 Sep', done:false },
    { text:'Descargar mapas offline de Curazao en Google Maps', priority:'normal', deadline:'30 Sep', done:false },
    { text:'Cargar power bank, drone y baterías (noche del 30 Sep)', priority:'normal', deadline:'30 Sep noche', done:false },
    { text:'Revisar maletas: pasaportes, DI Card, autorizaciones', priority:'normal', deadline:'30 Sep noche', done:false },
    { text:'Snorkel — llevar o confirmar alquiler allá ($10–15 USD)', priority:'normal', deadline:'Antes del 25 Sep', done:false },
  ];

  for (let i = 0; i < checkItems.length; i++) {
    const c = checkItems[i];
    await pool.query(`
      INSERT INTO checklist_items (trip_id, text, priority, deadline, done, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6)
    `, [tripId, c.text, c.priority, c.deadline, c.done, i]);
  }

  // Spots
  const spotsData = [
    { name:'Grote Knip (Kenepa Grandi)', desc:'Postal #1 · Acantilados + agua turquesa', photo:'https://images.unsplash.com/photo-1567599672391-17b31d92e431?w=800&q=85', day:'D4', drone:true },
    { name:'Handelskade · Willemstad', desc:'Casas de colores · Puente Reina Emma', photo:'https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=800&q=85', day:'D2', drone:false },
    { name:'Klein Curazao', desc:'Faro rosa · Playa blanca · Naufragio', photo:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', day:'D3', drone:true },
    { name:'Playa Kokomo', desc:'El columpio viral · Toma cenital drone', photo:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', day:'D4', drone:true },
    { name:'Fort Nassau', desc:'360° de Willemstad · Mejor atardecer urbano', photo:'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', day:'D2', drone:false },
  ];

  for (let i = 0; i < spotsData.length; i++) {
    const s = spotsData[i];
    await pool.query(`
      INSERT INTO spots (trip_id, name, description, photo_url, day_ref, drone_ok, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [tripId, s.name, s.desc, s.photo, s.day, s.drone, i]);
  }

  console.log('✅ Curazao trip seeded successfully!');
  return tripId;
}

module.exports = { seed };
