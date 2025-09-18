const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'applicationmanager', // Haupt-Schema
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true // Für komplexe Abfragen
});

module.exports = pool;