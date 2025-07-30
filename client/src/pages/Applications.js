import React, { useState, useEffect } from 'react';
import { getApplications, getAppConfig } from '../api';
import './Applications.css';

export default function Applications() {
    const [apps, setApps] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [configData, setConfigData] = useState({ columns: [], rows: [] });
    const [selectedTab, setSelectedTab] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const { data } = await getApplications();
            setApps(data);
        } catch (err) {
            console.error('Fehler beim Laden der Anwendungen:', err);
        }
    };

    const handleAppClick = async (app) => {
        setSelectedApp(app);
        setLoading(true);
        setSelectedTab(null);
        try {
            const response = await getAppConfig(app.key);
            const { columns, rows } = response.data;
            setConfigData({ columns, rows });

            const keys = rows.map(r => r.config_key).filter(Boolean);
            if (keys.length > 0) {
                setSelectedTab(keys[0]);
            }
        } catch (err) {
            console.error('Fehler beim Laden der Konfiguration:', err);
            setConfigData({ columns: [], rows: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (row) => {
        const isNew = typeof row.id === 'string' && row.id.startsWith('temp-');

        const method = isNew ? 'POST' : 'PUT';
        const url = isNew
            ? `http://localhost:5000/api/applications/${selectedApp.key}/config`
            : `http://localhost:5000/api/applications/${selectedApp.key}/config/${row.id}`;

        try {
            const payload = { ...row };
            if (isNew) delete payload.id; // <-- temporäre ID entfernen

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });


            if (!response.ok) throw new Error('Fehler beim Speichern');

            const result = await response.json();

            setConfigData(prev => {
                const updatedRows = prev.rows.map(r =>
                    r.id === row.id
                        ? { ...row, id: result.id } // echte ID ersetzen
                        : r
                );
                return { ...prev, rows: updatedRows };
            });
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
        }
    };

    const handleAdd = () => {
        if (!selectedTab) {
            alert("Bitte zuerst einen Tab auswählen, um dort einen Eintrag hinzuzufügen.");
            return;
        }

        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const newRow = { id: tempId, config_key: selectedTab };
        configData.columns.forEach(col => {
            if (col !== 'id' && col !== 'config_key') newRow[col] = '';
        });

        setConfigData(prev => ({
            ...prev,
            rows: [...prev.rows, newRow]
        }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Diesen Eintrag wirklich löschen?')) return;
        try {
            await fetch(`/api/applications/${selectedApp.key}/config/${id}`, {
                method: 'DELETE'
            });
            setConfigData(prev => ({
                ...prev,
                rows: prev.rows.filter(row => row.id !== id)
            }));
        } catch (err) {
            console.error('Fehler beim Löschen:', err);
        }
    };

    return (
        <div className="applications-container">
            <div className="sidebar">
                <h3>Anwendungen</h3>
                {apps.map(app => (
                    <button
                        key={app.id}
                        className={`app-btn ${selectedApp?.key === app.key ? 'active' : ''}`}
                        onClick={() => handleAppClick(app)}
                    >
                        {app.name}
                    </button>
                ))}
            </div>

            <div className="main">
                {loading && <p>Lade Konfiguration...</p>}

                {!loading && selectedApp && (
                    <>
                        <h2>{selectedApp.name} – Konfiguration</h2>
                        <div className="tabs">
                            {[...new Set(configData.rows.map(row => row.config_key))].map(key => (
                                <button
                                    key={key}
                                    className={`tab-btn ${selectedTab === key ? 'active' : ''}`}
                                    onClick={() => setSelectedTab(key)}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleAdd}>➕ Neuer Eintrag</button>

                        <div className="config-details">
                            {configData.rows
                                .filter(row => row.config_key === selectedTab || selectedTab === null)
                                .map((conf, index) => (
                                    <div key={conf.id || index} className="config-entry">
                                        {Object.entries(conf).map(([key, value]) =>
                                            key === 'id' ? null : (
                                                <div key={key}>
                                                    <strong>{key}:</strong>{' '}
                                                    <input
                                                        type="text"
                                                        value={value || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setConfigData(prev => {
                                                                const updatedRows = prev.rows.map(r =>
                                                                    r.id === conf.id
                                                                        ? { ...r, [key]: val }
                                                                        : r
                                                                );
                                                                return { ...prev, rows: updatedRows };
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            )
                                        )}
                                        <button onClick={() => handleSave(conf)}>💾 Speichern</button>
                                        {conf.id && !String(conf.id).startsWith('temp-') && (
                                            <button onClick={() => handleDelete(conf.id)}>🗑️ Löschen</button>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
