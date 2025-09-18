const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db'); // Dein DB-Modul

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Anfrage validieren
    if (!username || !password) {
        return res.status(400).json({ message: 'Benutzername und Passwort erforderlich' });
    }

    try {
        // 2. Benutzer aus der DB holen
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Benutzer nicht gefunden' });
        }

        // 3. Passwort prüfen
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Falsches Passwort' });
        }

        // 4. Token erzeugen
        const tokenPayload = {
            userId: user.id,
            username: user.username
        };

        const token = jwt.sign(tokenPayload, SECRET, { expiresIn: '1h' });

        // 5. Token zurückgeben
        return res.json({ token });
    } catch (err) {
        console.error('Fehler beim Login:', err);
        return res.status(500).json({ message: 'Serverfehler' });
    }
});


module.exports = router;
