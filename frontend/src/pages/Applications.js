import React, { useState, useEffect } from 'react';
import { getApplications, getTables, getRows, createRow, updateRow, deleteRow } from '../api';
import './Applications.css';

export default function Applications() {
    const [apps, setApps] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);

    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);

    const [columns, setColumns] = useState([]);
    const [pk, setPk] = useState('id');
    const [rows, setRows] = useState([]);

    const [loading, setLoading] = useState(false);

    // Apps laden
    useEffect(() => {
        (async () => {
            try {
                const { data } = await getApplications();
                setApps(data);
            } catch (e) {
                console.error('Fehler beim Laden der Anwendungen:', e);
            }
        })();
    }, []);

    // Tabelle laden
    const loadTable = async (appKey, tableName) => {
        if (!appKey || !tableName) return;
        setLoading(true);
        try {
            const { data } = await getRows(appKey, tableName); // { columns, primaryKey, rows }
            setColumns(data.columns || []);
            setPk(data.primaryKey || 'id');
            setRows(Array.isArray(data.rows) ? data.rows : []);
        } catch (e) {
            console.error('Fehler beim Laden der Zeilen:', e);
        } finally {
            setLoading(false);
        }
    };

    // Klick auf App → Tabellen laden, 1. Tabelle aktivieren
    const handleAppClick = async (app) => {
        setSelectedApp(app);
        setSelectedTable(null);
        setColumns([]); setRows([]);

        try {
            const { data } = await getTables(app.key);
            // robust normalisieren (falls Backend-Keys anders heißen)
            const norm = (data || []).map(t => ({
                name: t.name ?? t.table_name,
                label: t.label ?? t.display_name ?? t.name ?? t.table_name,
                primaryKey: t.primaryKey ?? t.primary_key_col ?? 'id',
                readOnly: !!(t.readOnly ?? t.read_only),
            })).filter(t => !!t.name);

            setTables(norm);
            if (norm.length) {
                setSelectedTable(norm[0].name);
                loadTable(app.key, norm[0].name);
            }
        } catch (e) {
            console.error('Fehler beim Laden der Tabellen:', e);
        }
    };

    const handleTabClick = (t) => {
        setSelectedTable(t.name);
        loadTable(selectedApp.key, t.name);
    };

    const handleAdd = () => {
        if (!selectedTable || columns.length === 0) return;
        const tempId = `temp-${Date.now()}`;
        const empty = Object.fromEntries(columns.map(c => [c, c === pk ? tempId : '']));
        setRows(prev => [...prev, empty]);
    };

    const handleSave = async (row) => {
        const idVal = row[pk];
        const data = { ...row };
        delete data[pk];

        try {
            if (String(idVal).startsWith('temp-')) {
                const res = await createRow(selectedApp.key, selectedTable, data);
                const newId = res.data.id;
                setRows(prev => prev.map(r => r[pk] === idVal ? { ...r, [pk]: newId } : r));
            } else {
                await updateRow(selectedApp.key, selectedTable, idVal, data);
            }
        } catch (e) {
            console.error('Fehler beim Speichern:', e);
        }
    };

    const handleDelete = async (row) => {
        const idVal = row[pk];
        try {
            if (String(idVal).startsWith('temp-')) {
                setRows(prev => prev.filter(r => r[pk] !== idVal));
            } else {
                await deleteRow(selectedApp.key, selectedTable, idVal);
                setRows(prev => prev.filter(r => r[pk] !== idVal));
            }
        } catch (e) {
            console.error('Fehler beim Löschen:', e);
        }
    };

    return (
        <div className="applications-container">
            <div className="sidebar">
                <h3>Anwendungen</h3>
                {apps.map(app => (
                    <button
                        key={app.key} // eindeutiger key
                        className={`app-btn ${selectedApp?.key === app.key ? 'active' : ''}`}
                        onClick={() => handleAppClick(app)}
                    >
                        {app.name}
                    </button>
                ))}
            </div>

            <div className="main">
                {selectedApp && (
                    <>
                        <h2>{selectedApp.name}</h2>

                        <div className="tabs">
                            {tables.map(t => (
                                <button
                                    key={t.name} // eindeutiger key
                                    className={`tab-btn ${selectedTable === t.name ? 'active' : ''}`}
                                    onClick={() => handleTabClick(t)}
                                >
                                    {t.label}
                                </button>
                            ))}
                            <button onClick={handleAdd} style={{ marginLeft: 'auto' }}>➕ Neuer Eintrag</button>
                        </div>

                        {loading && <p>Lade…</p>}

                        {!loading && selectedTable && (
                            <div className="config-details">
                                {rows.map((r, idx) => (
                                    <div key={r[pk] ?? `row-${idx}`} className="config-entry">
                                        {columns.map(c => (
                                            c === pk ? null : (
                                                <div key={`${idx}-${c}`}>
                                                    <strong>{c}:</strong>{' '}
                                                    <input
                                                        value={r[c] ?? ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setRows(prev =>
                                                                prev.map((x, i) => i === idx ? { ...x, [c]: val } : x)
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            )
                                        ))}
                                        <button onClick={() => handleSave(r)}>💾 Speichern</button>
                                        <button onClick={() => handleDelete(r)}>🗑️ Löschen</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
