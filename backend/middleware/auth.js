// middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Token fehlt' });

    const token = authHeader.split(' ')[1]; // "Bearer <token>"

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded; // { userId, username }
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token ungültig' });
    }
}

module.exports = verifyToken;
