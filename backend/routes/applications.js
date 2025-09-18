const express = require('express');
const router = express.Router();
const db = require('../db');

// GET: Alle Applikationen
router.get('/', async (req, res) => {
    try {
        const [apps] = await db.query(`
            SELECT 
              id,
              app_key AS appKey,
              display_name AS displayName,
              schema_name AS schemaName,
              is_active AS isActive
            FROM managed_applications
            ORDER BY display_name
        `);

        res.json(apps.map(app => ({
            id: app.id,
            key: app.appKey,
            name: app.displayName,
            schema: app.schemaName,
            active: app.isActive
        })));

    } catch (err) {
        console.error('MySQL Error:', err);
        res.status(500).json({
            error: 'Database query failed',
            details: err.sqlMessage,
            sql: err.sql
        });
    }
});

// GET: Konfiguration einer spezifischen App
router.get('/:appKey/config', async (req, res) => {
    const { appKey } = req.params;

    try {
        const [apps] = await db.query(`
            SELECT schema_name, config_table 
            FROM managed_applications 
            WHERE app_key = ?
        `, [appKey]);

        if (apps.length === 0) {
            return res.status(404).json({ error: 'Application not registered' });
        }

        const { schema_name, config_table } = apps[0];

        // Dynamische Spalten holen
        const [columns] = await db.query(`SHOW COLUMNS FROM \`${schema_name}\`.\`${config_table}\``);
        const [rows] = await db.query(`SELECT * FROM \`${schema_name}\`.\`${config_table}\``);

        res.json({
            columns: columns.map(col => col.Field), // z. B. ["id", "config_key", "preisWoche", ...]
            rows
        });
    } catch (err) {
        console.error('Fehler beim Abrufen der Konfiguration:', err);
        res.status(500).json({ error: 'Fehler beim Laden der Konfiguration', details: err.message });
    }
});

router.put('/:appKey/config/:id', async (req, res) => {
    const { appKey, id } = req.params;
    const data = req.body;
    console.log('PUT request received:', req.params.appKey, req.params.id);

    try {
        const [[app]] = await db.query(`
            SELECT schema_name, config_table 
            FROM managed_applications 
            WHERE app_key = ?
        `, [appKey]);

        if (!app) return res.status(404).json({ error: 'App not found' });

        const keys = Object.keys(data).filter(k => k !== 'id');
        const values = keys.map(k => data[k]);

        const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
        const sql = `UPDATE \`${app.schema_name}\`.\`${app.config_table}\` SET ${setClause} WHERE id = ?`;

        await db.query(sql, [...values, id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Update failed', details: err.message });
    }
});

// POST: Neuen Konfigurationseintrag hinzufügen
router.post('/:appKey/config', async (req, res) => {
    const { appKey } = req.params;
    const newData = req.body;

    try {
        const [apps] = await db.query(`
        SELECT schema_name, config_table 
        FROM managed_applications 
        WHERE app_key = ?
      `, [appKey]);

        if (apps.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const { schema_name, config_table } = apps[0];
        const [result] = await db.query(
            `INSERT INTO \`${schema_name}\`.\`${config_table}\` SET ?`,
            [newData]
        );

        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error('Fehler beim Einfügen:', err);
        res.status(500).json({ error: 'Einfügen fehlgeschlagen', details: err.message });
    }
});

// DELETE: Konfigurationseintrag löschen
router.delete('/:appKey/config/:id', async (req, res) => {
    const { appKey, id } = req.params;

    try {
        const [apps] = await db.query(`
        SELECT schema_name, config_table 
        FROM managed_applications 
        WHERE app_key = ?
      `, [appKey]);

        if (apps.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const { schema_name, config_table } = apps[0];

        await db.query(
            `DELETE FROM \`${schema_name}\`.\`${config_table}\` WHERE id = ?`,
            [id]
        );

        res.status(204).send();
    } catch (err) {
        console.error('Fehler beim Löschen:', err);
        res.status(500).json({ error: 'Löschen fehlgeschlagen', details: err.message });
    }
});





module.exports = router;
