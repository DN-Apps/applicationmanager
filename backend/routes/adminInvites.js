const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../db');
const { transporter } = require('../mailer');

const router = express.Router();

function escapeHtml(str = '') {
    return str.replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[s]));
}

/**
 * POST /api/admin-invites
 * Body: { username }
 * → speichert Invite + sendet Mail an daniel-nedic@hotmail.de
 */
router.post('/admin-invites', async (req, res) => {
    try {
        const { username } = req.body || {};
        if (!username || typeof username !== 'string') {
            return res.status(400).json({ error: 'username ist erforderlich' });
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresHours = Number(process.env.INVITE_EXPIRES_HOURS || 24);
        const expiresAt = new Date(Date.now() + expiresHours * 3600 * 1000);

        await db.execute(
            'INSERT INTO admin_invites (username, token_hash, expires_at) VALUES (?, ?, ?)',
            [username, tokenHash, expiresAt]
        );

        const base = (process.env.APP_BASE_URL || '').replace(/\/$/, '');
        const link = `${base}/set-admin-passwort?token=${rawToken}`;

        const html = `
      <p>Es wurde eine Admin-Anfrage für den Benutzernamen <b>${escapeHtml(username)}</b> erstellt.</p>
      <p>Klicke auf den folgenden Link, um ein Passwort zu setzen (gültig bis ${expiresAt.toISOString()}):</p>
      <p><a href="${link}">${link}</a></p>
      <p><b>Token:</b> ${rawToken}</p>
    `;

        await transporter.sendMail({
            to: 'daniel-nedic@hotmail.de',
            from: process.env.MAIL_FROM,
            subject: 'Admin-Anfrage – Passwort setzen',
            html
        });

        res.json({ ok: true });
    } catch (err) {
        console.error('[INVITE][CREATE]', err);
        res.status(500).json({ error: 'Fehler beim Erstellen der Anfrage' });
    }
});

/**
 * POST /api/admin-invites/accept
 * Body: { token, password, username? }
 * → prüft Token, legt User an, markiert Invite als consumed
 */
router.post('/admin-invites/accept', async (req, res) => {
    const { token, password, username } = req.body || {};
    if (!token || !password) {
        return res.status(400).json({ error: 'token und password sind erforderlich' });
    }
    if (password.length < 10) {
        return res.status(400).json({ error: 'Passwort muss mind. 10 Zeichen haben' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [rows] = await conn.execute(
            'SELECT * FROM admin_invites WHERE token_hash = ? FOR UPDATE',
            [tokenHash]
        );
        if (rows.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Ungültiger oder bereits verbrauchter Token' });
        }

        const invite = rows[0];
        if (invite.consumed_at) {
            await conn.rollback();
            return res.status(400).json({ error: 'Token bereits verwendet' });
        }
        if (new Date(invite.expires_at) < new Date()) {
            await conn.rollback();
            return res.status(400).json({ error: 'Token abgelaufen' });
        }

        // Optional: mitgesendeten username gegenprüfen
        if (username && username !== invite.username) {
            await conn.rollback();
            return res.status(400).json({ error: 'Benutzername stimmt nicht mit der Anfrage überein' });
        }

        // existiert Nutzer schon?
        const [u] = await conn.execute('SELECT id FROM users WHERE username = ?', [invite.username]);
        if (u.length > 0) {
            await conn.rollback();
            return res.status(409).json({ error: 'Benutzername existiert bereits' });
        }

        const hash = await bcrypt.hash(password, 10);
        await conn.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [invite.username, hash]
        );
        await conn.execute(
            'UPDATE admin_invites SET consumed_at = NOW() WHERE id = ?',
            [invite.id]
        );

        await conn.commit();
        res.json({ ok: true });
    } catch (err) {
        await conn.rollback();
        console.error('[INVITE][ACCEPT]', err);
        res.status(500).json({ error: 'Fehler beim Setzen des Passworts' });
    } finally {
        conn.release();
    }
});

module.exports = router;
