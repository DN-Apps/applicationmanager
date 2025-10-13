const express = require('express');
const router = express.Router();
const db = require('../db'); // mysql2/promise Pool für Registry + (hier) auch Datenzugriff

// ---- helpers ----
const IDENT_RX = /^[A-Za-z0-9_]+$/;
const safeIdent = (s) => IDENT_RX.test(s || '') ? s : null;
const qIdent = (s) => `\`${s}\``;

// App + Table aus Registry (Whitelist) holen
async function getAppAndTable(appKey, tableName = null) {
    const [[app]] = await db.query(
        'SELECT * FROM managed_applications WHERE app_key=? AND is_active=1',
        [appKey]
    );
    if (!app) return { error: 'Application not registered or inactive', status: 404 };

    if (!tableName) return { app };

    const [[tbl]] = await db.query(
        'SELECT * FROM managed_tables WHERE app_id=? AND table_name=?',
        [app.id, tableName]
    );
    if (!tbl) return { error: 'Table not registered for this app', status: 404 };

    // Identifier absichern
    if (!safeIdent(app.schema_name) || !safeIdent(tbl.table_name) || !safeIdent(tbl.primary_key_col)) {
        return { error: 'Invalid identifiers configured', status: 500 };
    }
    return { app, tbl };
}

// ---- routes ----

// Apps inkl. ihrer Tabellen (aus Registry)
router.get('/', async (_req, res) => {
    try {
        const [apps] = await db.query(
            `SELECT id, app_key, display_name, schema_name, is_active
         FROM managed_applications
        WHERE is_active=1
        ORDER BY display_name`
        );
        const [tables] = await db.query(
            `SELECT app_id, table_name, display_name
         FROM managed_tables
        ORDER BY display_name`
        );

        const grouped = apps.map(a => ({
            id: a.id,
            key: a.app_key,
            name: a.display_name,
            schema: a.schema_name,
            tables: tables
                .filter(t => t.app_id === a.id)
                .map(t => ({ name: t.table_name, label: t.display_name }))
        }));
        res.json(grouped);
    } catch (err) {
        console.error('[APPS][LIST]', err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// Tabellenliste einer App (Frontend erwartet name/label/primaryKey/readOnly)
router.get('/:appKey/tables', async (req, res) => {
    try {
        const { appKey } = req.params;
        const { app, error, status } = await getAppAndTable(appKey);
        if (error) return res.status(status).json({ error });

        const [tables] = await db.query(
            `SELECT table_name, display_name, primary_key_col, read_only
         FROM managed_tables
        WHERE app_id=?
        ORDER BY display_name`,
            [app.id]
        );

        const normalized = tables.map(t => ({
            name: t.table_name,
            label: t.display_name,
            primaryKey: t.primary_key_col,
            readOnly: !!t.read_only,
        }));

        res.json(normalized);
    } catch (err) {
        console.error('[TABLES][LIST]', err);
        res.status(500).json({ error: 'Failed to load tables' });
    }
});

// Spalten + Daten einer Tabelle
router.get('/:appKey/tables/:table/rows', async (req, res) => {
    const { appKey, table } = req.params;
    try {
        const { app, tbl, error, status } = await getAppAndTable(appKey, table);
        if (error) return res.status(status).json({ error });

        const [cols] = await db.query(
            `SHOW COLUMNS FROM ${qIdent(app.schema_name)}.${qIdent(tbl.table_name)}`
        );
        const [rows] = await db.query(
            `SELECT * FROM ${qIdent(app.schema_name)}.${qIdent(tbl.table_name)} LIMIT 1000`
        );

        res.json({
            columns: cols.map(c => c.Field),
            primaryKey: tbl.primary_key_col,
            rows
        });
    } catch (err) {
        console.error('[ROWS][LIST]', err);
        res.status(500).json({ error: 'Failed to load rows', details: err.message });
    }
});

// CREATE
router.post('/:appKey/tables/:table/rows', async (req, res) => {
    const { appKey, table } = req.params;
    const data = req.body || {};
    try {
        const { app, tbl, error, status } = await getAppAndTable(appKey, table);
        if (error) return res.status(status).json({ error });
        if (tbl.read_only) return res.status(403).json({ error: 'Table is read-only' });

        // nur existierende Spalten
        const [cols] = await db.query(
            `SHOW COLUMNS FROM ${qIdent(app.schema_name)}.${qIdent(tbl.table_name)}`
        );
        const allowed = new Set(cols.map(c => c.Field));
        const payload = {};
        for (const [k, v] of Object.entries(data)) {
            if (allowed.has(k) && k !== tbl.primary_key_col) payload[k] = v;
        }
        if (Object.keys(payload).length === 0) {
            return res.status(400).json({ error: 'No valid columns in payload' });
        }

        const [result] = await db.query(
            `INSERT INTO ${qIdent(app.schema_name)}.${qIdent(tbl.table_name)} SET ?`,
            [payload]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error('[ROW][CREATE]', err);
        res.status(500).json({ error: 'Insert failed', details: err.message });
    }
});

// UPDATE
router.put('/:appKey/tables/:table/rows/:id', async (req, res) => {
    const { appKey, table, id } = req.params;
    const data = req.body || {};
    try {
        const { app, tbl, error, status } = await getAppAndTable(appKey, table);
        if (error) return res.status(status).json({ error });
        if (tbl.read_only) return res.status(403).json({ error: 'Table is read-only' });

        const [cols] = await db.query(
            `SHOW COLUMNS FROM ${qIdent(app.schema_name)}.${qIdent(tbl.table_name)}`
        );
        const allowed = new Set(cols.map(c => c.Field));
        const keys = Object.keys(data).filter(k => allowed.has(k) && k !== tbl.primary_key_col);
        if (keys.length === 0) return res.status(400).json({ error: 'No valid columns to update' });

        const setSql = keys.map(k => `${qIdent(k)}=?`).join(', ');
        const vals = keys.map(k => data[k]);

        const sql = `UPDATE ${qIdent(app.schema_name)}.${qIdent(tbl.table_name)} SET ${setSql} WHERE ${qIdent(tbl.primary_key_col)}=?`;
        await db.query(sql, [...vals, id]);
        res.json({ ok: true });
    } catch (err) {
        console.error('[ROW][UPDATE]', err);
        res.status(500).json({ error: 'Update failed', details: err.message });
    }
});

// DELETE
router.delete('/:appKey/tables/:table/rows/:id', async (req, res) => {
    const { appKey, table, id } = req.params;
    try {
        const { app, tbl, error, status } = await getAppAndTable(appKey, table);
        if (error) return res.status(status).json({ error });
        if (tbl.read_only) return res.status(403).json({ error: 'Table is read-only' });

        await db.query(
            `DELETE FROM ${qIdent(app.schema_name)}.${qIdent(tbl.table_name)} WHERE ${qIdent(tbl.primary_key_col)}=?`,
            [id]
        );
        res.status(204).send();
    } catch (err) {
        console.error('[ROW][DELETE]', err);
        res.status(500).json({ error: 'Delete failed', details: err.message });
    }
});

module.exports = router;
