require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const authService = require('../services/auth.service');
const pool = require('../db/pool');

async function createUserFromEnvironment() {
    const { NEW_USERNAME, NEW_PASSWORD, NEW_ROLE, NEW_TECHNICIAN_ID } = process.env;
    if (!NEW_USERNAME || !NEW_PASSWORD || !NEW_ROLE) {
        throw new Error('Set NEW_USERNAME, NEW_PASSWORD and NEW_ROLE before running this command.');
    }
    const user = await authService.createUser({
        username: NEW_USERNAME,
        password: NEW_PASSWORD,
        role: NEW_ROLE,
        technician_id: NEW_TECHNICIAN_ID || null
    });
    console.log(`Created ${user.role} account: ${user.username}`);
}

createUserFromEnvironment()
    .catch((error) => {
        console.error('User creation failed:', error.code === '23505' ? 'username already exists' : error.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());