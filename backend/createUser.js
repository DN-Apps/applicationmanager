// createUser.js
const bcrypt = require('bcrypt');
const db = require('./db');

async function createUser(username, plainPassword) {
    try {
        const hash = await bcrypt.hash(plainPassword, 10); // Salt rounds = 10
        const [result] = await db.query(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, hash]
        );
        console.log(`Benutzer '${username}' erfolgreich angelegt mit ID ${result.insertId}`);
    } catch (err) {
        console.error('Fehler beim Erstellen des Benutzers:', err);
    } finally {
        process.exit(); // Skript beenden
    }
}

// ⬇️ Hier Benutzername + Passwort eintragen:
//createUser('benutzer', 'passwort');
