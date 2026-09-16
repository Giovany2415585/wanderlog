const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS trips (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL,
      flag VARCHAR(10) DEFAULT '🌍',
      start_date DATE,
      end_date DATE,
      status VARCHAR(50) DEFAULT 'planned',
      description TEXT,
      cover_url TEXT DEFAULT 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS days (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
      day_number INTEGER NOT NULL,
      date DATE,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      icon VARCHAR(10) DEFAULT '📅',
      has_car BOOLEAN DEFAULT false,
      drone_ok BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      day_id UUID REFERENCES days(id) ON DELETE CASCADE,
      time VARCHAR(20),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) DEFAULT 'activity',
      icon VARCHAR(10) DEFAULT '📍',
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
      text VARCHAR(500) NOT NULL,
      priority VARCHAR(20) DEFAULT 'normal',
      deadline VARCHAR(100),
      done BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS spots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(500),
      photo_url TEXT,
      day_ref VARCHAR(10),
      drone_ok BOOLEAN DEFAULT false,
      sort_order INTEGER DEFAULT 0
    );
  `);
  console.log('✅ Database initialized');
}

module.exports = { pool, initDB };
