// src/SetAdminCredentials.js
import { useEffect, useState } from 'react';
import axios from 'axios';

function SetAdminCredentials() {
    const API_URL = process.env.REACT_APP_API_URL;
    console.log('SetAdminCredentials mounted');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [token, setToken] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        try {
            const url = new URL(window.location.href);
            const t = url.searchParams.get('token');
            if (t) setToken(t);
        } catch { }
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setMsg('');
        if (password.length < 10) {
            setMsg('❌ Passwort muss mindestens 10 Zeichen haben.');
            return;
        }
        if (password !== password2) {
            setMsg('❌ Passwörter stimmen nicht überein.');
            return;
        }
        if (!token) {
            setMsg('❌ Token ist erforderlich.');
            return;
        }

        try {
            // username wird mitgesendet; Backend kann ihn zur Absicherung gegenprüfen
            await axios.post(`${API_URL}/api/admin-invites/accept`, { token, password, username });
            setMsg('✅ Passwort gesetzt. Du kannst dich jetzt einloggen.');
            setPassword(''); setPassword2('');
        } catch (err) {
            const text = err?.response?.data?.error || 'Fehler beim Setzen des Passworts';
            setMsg(`❌ ${text}`);
        }
    };

    return (
        <div style={{ padding: 30, maxWidth: 420 }}>
            <h2>Admin-Zugang einrichten</h2>
            <p style={{ color: '#555' }}>Bitte Benutzername, neues Passwort und den Token aus der E-Mail eingeben.</p>

            <form onSubmit={submit}>
                <label style={{ display: 'block', marginTop: 12 }}>
                    Benutzername
                    <input
                        style={{ display: 'block', width: '100%', marginTop: 6 }}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="z. B. qa-admin"
                        required
                    />
                </label>

                <label style={{ display: 'block', marginTop: 12 }}>
                    Neues Passwort (min. 10 Zeichen)
                    <input
                        type="password"
                        style={{ display: 'block', width: '100%', marginTop: 6 }}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={10}
                    />
                </label>

                <label style={{ display: 'block', marginTop: 12 }}>
                    Passwort wiederholen
                    <input
                        type="password"
                        style={{ display: 'block', width: '100%', marginTop: 6 }}
                        value={password2}
                        onChange={e => setPassword2(e.target.value)}
                        required
                        minLength={10}
                    />
                </label>

                <label style={{ display: 'block', marginTop: 12 }}>
                    Token (aus der E-Mail)
                    <input
                        style={{ display: 'block', width: '100%', marginTop: 6 }}
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        placeholder="Token hier einfügen"
                        required
                    />
                </label>

                <button type="submit" style={{ marginTop: 16 }}>Speichern</button>
            </form>

            {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
        </div>
    );
}

export default SetAdminCredentials
