const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

router.get('/users', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username FROM users');
        res.json(users);
    } catch (err) {
        console.error('Fehler beim Abrufen der Nutzer:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
});

module.exports = router;
