// src/pages/Users.js
import React, { useEffect, useState } from 'react';
import { api } from '../api'; // Stelle sicher, dass der Pfad korrekt ist

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users'); // Token wird automatisch mitgesendet
                setUsers(response.data);
            } catch (err) {
                console.error('Fehler beim Laden der Nutzer:', err);
                setError('Konnte Benutzer nicht laden. Bist du eingeloggt?');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div className="page"><p>Lade Benutzer...</p></div>;
    }

    if (error) {
        return <div className="page"><p style={{ color: 'red' }}>{error}</p></div>;
    }

    return (
        <div className="page">
            <h2>User Management</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.username}</li>
                ))}
            </ul>
        </div>
    );
}
