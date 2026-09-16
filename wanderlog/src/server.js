require('dotenv').config();
const express = require('express');
const path = require('path');
const { pool, initDB } = require('./db');
const { seed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// HOME
app.get('/', async (req, res) => {
  try {
    const trips = await pool.query('SELECT * FROM trips ORDER BY created_at DESC');
    res.render('index', { trips: trips.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading trips');
  }
});

// TRIP DETAIL
app.get('/trip/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [tripRes, daysRes, checkRes, spotsRes] = await Promise.all([
      pool.query('SELECT * FROM trips WHERE id=$1', [id]),
      pool.query('SELECT * FROM days WHERE trip_id=$1 ORDER BY day_number', [id]),
      pool.query('SELECT * FROM checklist_items WHERE trip_id=$1 ORDER BY sort_order', [id]),
      pool.query('SELECT * FROM spots WHERE trip_id=$1 ORDER BY sort_order', [id]),
    ]);
    if (!tripRes.rows[0]) return res.redirect('/');

    const days = daysRes.rows;
    for (const day of days) {
      const acts = await pool.query('SELECT * FROM activities WHERE day_id=$1 ORDER BY sort_order', [day.id]);
      day.activities = acts.rows;
    }

    const total = checkRes.rows.length;
    const done = checkRes.rows.filter(c => c.done).length;

    res.render('trip', {
      trip: tripRes.rows[0],
      days,
      checklist: checkRes.rows,
      spots: spotsRes.rows,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      doneCnt: done,
      totalCnt: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading trip');
  }
});

// API: TOGGLE CHECKLIST
app.patch('/api/checklist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE checklist_items SET done = NOT done WHERE id=$1 RETURNING done, trip_id',
      [id]
    );
    const item = result.rows[0];
    const stats = await pool.query(
      'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE done=true) as done FROM checklist_items WHERE trip_id=$1',
      [item.trip_id]
    );
    const { total, done } = stats.rows[0];
    res.json({ done: item.done, progress: Math.round((done / total) * 100), done_cnt: done, total_cnt: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: ADD TRIP
app.post('/api/trips', async (req, res) => {
  try {
    const { name, country, flag, start_date, end_date, description, cover_url } = req.body;
    const result = await pool.query(
      'INSERT INTO trips (name, country, flag, start_date, end_date, description, cover_url, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, country, flag || '🌍', start_date || null, end_date || null, description || '', cover_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', 'planned']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: ADD CHECKLIST ITEM
app.post('/api/trips/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, priority, deadline } = req.body;
    const max = await pool.query('SELECT MAX(sort_order) as mx FROM checklist_items WHERE trip_id=$1', [id]);
    const order = (max.rows[0].mx || 0) + 1;
    const result = await pool.query(
      'INSERT INTO checklist_items (trip_id, text, priority, deadline, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id, text, priority || 'normal', deadline || '', order]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: ADD DAY
app.post('/api/trips/:id/days', async (req, res) => {
  try {
    const { id } = req.params;
    const { day_number, title, subtitle, icon, has_car, drone_ok, date } = req.body;
    const result = await pool.query(
      'INSERT INTO days (trip_id, day_number, title, subtitle, icon, has_car, drone_ok, date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [id, day_number, title, subtitle || '', icon || '📅', has_car || false, drone_ok !== false, date || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: ADD ACTIVITY
app.post('/api/days/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const { time, title, description, icon, type } = req.body;
    const max = await pool.query('SELECT MAX(sort_order) as mx FROM activities WHERE day_id=$1', [id]);
    const order = (max.rows[0].mx || 0) + 1;
    const result = await pool.query(
      'INSERT INTO activities (day_id, time, title, description, icon, type, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [id, time || '', title, description || '', icon || '📍', type || 'activity', order]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: DELETE TRIP
app.delete('/api/trips/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM trips WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HEALTH CHECK
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// START
async function start() {
  await initDB();
  await seed();
  app.listen(PORT, () => console.log(`🚀 WanderLog running on port ${PORT}`));
}

start().catch(console.error);
