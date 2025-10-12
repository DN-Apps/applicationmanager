require('dotenv').config();
const express = require('express');
const cors = require('cors');

const applicationsRouter = require('./routes/applications');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/users');
const adminInvites = require('./routes/adminInvites'); // ← unser neuer Router
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
['DB_HOST', 'DB_USER', 'DB_PASSWORD'].forEach(k => {
    if (!process.env[k]) console.warn(`WARN: ${k} fehlt in .env`);
});

const app = express();

/* ---------- Middleware ---------- */
app.use(cors({ origin: true })); // ggf. origin auf deine Frontend-URL einschränken
app.use(express.json());

/* ---------- Health ---------- */
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' })
);

/* ---------- Routes ---------- */
app.use('/api/applications', applicationsRouter);
app.use('/api/auth', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', adminInvites); // ← HIER wird der Invite-Flow aktiv (POST /api/admin-invites, /api/admin-invites/accept)

/* ---------- 404 ---------- */
app.use((req, res, next) => {
    if (!res.headersSent) return res.status(404).json({ error: 'Not found' });
    next();
});

/* ---------- Error Handler ---------- */
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

/* ---------- Start ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT} [ENV=${process.env.NODE_ENV || 'development'}]`
    );
});
