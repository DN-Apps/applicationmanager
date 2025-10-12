// Login.js
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [inviteUser, setInviteUser] = useState('');
    const [inviteMsg, setInviteMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const location = useLocation();
    // Falls du vorher durch einen Guard umgeleitet wurdest, geht's dahin zurück; sonst "/"
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (loading) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
            localStorage.setItem('token', res.data.token);
            onLogin?.();
            navigate(from, { replace: true }); // <<< WICHTIG: weiterleiten
        } catch (err) {
            setError(err?.response?.data?.error || 'Login fehlgeschlagen');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteMsg('Sende Anfrage…');
        try {
            await axios.post(`${API_URL}/api/admin-invites`, { username: inviteUser });
            setInviteMsg('✅ Anfrage erstellt. E-Mail wurde an daniel-nedic@hotmail.de gesendet.');
            setInviteUser('');
        } catch (err) {
            const msg = err?.response?.data?.error || 'Fehler beim Erstellen der Anfrage';
            setInviteMsg(`❌ ${msg}`);
        }
    };

    return (
        <div style={{ padding: 30 }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Benutzername" required />
                <br />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort" required />
                <br />
                <button type="submit" disabled={loading}>{loading ? 'Bitte warten…' : 'Login'}</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <hr style={{ margin: '24px 0' }} />

            <h3>Neue Admin Anfrage</h3>
            <form onSubmit={handleInvite}>
                <input value={inviteUser} onChange={e => setInviteUser(e.target.value)} placeholder="Gewünschter Benutzername" required />
                <br />
                <button type="submit">Anfrage erstellen</button>
            </form>
            {inviteMsg && <p style={{ marginTop: 8 }}>{inviteMsg}</p>}
        </div>
    );
}

export default Login;
