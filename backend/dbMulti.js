// backend/dbMulti.js
const mysql = require('mysql2/promise');

const pools = new Map();
const keyOf = ({ host, port, user }) => `${host}:${port || 3306}:${user}`;

async function getPool(cfg) {
    const key = keyOf(cfg);
    if (pools.has(key)) return pools.get(key);

    const pool = mysql.createPool({
        host: cfg.host,
        port: cfg.port || 3306,
        user: cfg.user,
        password: cfg.pass,
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: true,
        charset: 'utf8mb4',
    });

    pools.set(key, pool);
    return pool;
}

module.exports = { getPool };
