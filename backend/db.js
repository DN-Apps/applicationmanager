const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'applicationmanager', // Haupt-Schema
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true // Für komplexe Abfragen
});

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = pool;