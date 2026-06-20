const express = require('express');
const cors = require('cors');
const router = express.Router();
const pool = require('../db');

router.use(cors());

// 1. GET ALL NOTES
router.get('/', async (req, res) => {
  try {
    // Sort by id so sticky notes stay in the same order on screen layout refresh
    const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST A NEW NOTE (Captures all your NoteModal settings)
router.post('/', async (req, res) => {
  const { title, color, status, tasks, x, y, width, height } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO todos (title, color, status, tasks, x, y, width, height) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title || 'Untitled',
        color || 'yellow',
        status || 'empty',
        JSON.stringify(tasks || []),
        x !== undefined && x !== null ? x : 150, // 👈 Safe fallback for 0, prevents database crash
        y !== undefined && y !== null ? y : 100, // 👈 Safe fallback for 0, prevents database crash
        width || 160,
        height || 160
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT (Update layout coordinates during drag or resize)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, color, status, tasks, x, y, width, height } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE todos 
       SET title = $1, color = $2, status = $3, tasks = $4, x = $5, y = $6, width = $7, height = $8 
       WHERE id = $9 RETURNING *`,
      [title, color, status, JSON.stringify(tasks), x, y, width, height, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE A NOTE
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
