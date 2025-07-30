import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            onLogin(); // Erfolg
        } catch (err) {
            setError('Login fehlgeschlagen');
        }
    };

    return (
        <div style={{ padding: 30 }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Benutzername" required />
                <br />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort" required />
                <br />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default Login;
