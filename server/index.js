const express = require('express');
const cors = require('cors');
const app = express();
const applicationsRouter = require('./routes/applications');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/users');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/applications', applicationsRouter);
app.use('/api/auth', authRoutes);
app.use('/api', usersRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});