const express = require('express');
const pool = require('./db');
const todosRouter = require('./routes/todos');
require('dotenv').config();
const cors = require('cors')

const app = express();
app.use(cors())
app.use(express.json());
app.use('/todos', todosRouter);

async function init() {  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      color TEXT DEFAULT 'yellow',
      status TEXT DEFAULT 'empty',
      tasks TEXT DEFAULT '[]',
      x NUMERIC DEFAULT 15,
      y NUMERIC DEFAULT 15,
      width NUMERIC DEFAULT 15,
      height NUMERIC DEFAULT 15,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}


init();