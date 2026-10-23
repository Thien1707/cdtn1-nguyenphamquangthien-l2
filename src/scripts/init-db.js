require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs/promises');
const path = require('path');
const pool = require('../db/pool');

async function initializeDatabase() {
    const schema = await fs.readFile(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    const seed = await fs.readFile(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8');
    await pool.query(schema);
    await pool.query(seed);
    console.log('PostgreSQL schema and seed data are ready.');
}

initializeDatabase()
    .catch((error) => {
        console.error('Database initialization failed:', error.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());