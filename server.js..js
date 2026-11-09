const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, 'students.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    course TEXT NOT NULL DEFAULT 'General',
    year_level INTEGER NOT NULL DEFAULT 1,
    grade REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validate(body) {
  const name = String(body.name || '').trim();
  const course = String(body.course || 'General').trim() || 'General';
  const year_level = parseInt(body.year_level, 10);
  const grade = Number(body.grade);
  if (!name) return { error: 'Name is required' };
  if (!Number.isInteger(year_level) || year_level < 1 || year_level > 6) return { error: 'Year level must be 1 to 6' };
  if (!Number.isFinite(grade) || grade < 0 || grade > 100) return { error: 'Grade must be 0 to 100' };
  return { name, course, year_level, grade };
}

// READ all (with optional search)
app.get('/api/students', (req, res) => {
  const q = `%${(req.query.q || '').trim()}%`;
  res.json(db.prepare('SELECT * FROM students WHERE name LIKE ? OR course LIKE ? ORDER BY id DESC').all(q, q));
});

// READ one
app.get('/api/students/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// CREATE
app.post('/api/students', (req, res) => {
  const v = validate(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const info = db
    .prepare('INSERT INTO students (name, course, year_level, grade) VALUES (?, ?, ?, ?)')
    .run(v.name, v.course, v.year_level, v.grade);
  res.status(201).json(db.prepare('SELECT * FROM students WHERE id = ?').get(info.lastInsertRowid));
});

// UPDATE
app.put('/api/students/:id', (req, res) => {
  const v = validate(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  const info = db
    .prepare('UPDATE students SET name = ?, course = ?, year_level = ?, grade = ? WHERE id = ?')
    .run(v.name, v.course, v.year_level, v.grade, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id));
});

// DELETE
app.delete('/api/students/:id', (req, res) => {
  const info = db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// DASHBOARD stats
app.get('/api/stats', (req, res) => {
  res.json(db.prepare(`
    SELECT COUNT(*) AS totalStudents,
           COALESCE(ROUND(AVG(grade), 1), 0) AS avgGrade,
           COALESCE(MAX(grade), 0) AS topGrade,
           COALESCE(SUM(CASE WHEN grade < 75 THEN 1 ELSE 0 END), 0) AS atRisk
    FROM students`).get());
});

app.listen(PORT, () => console.log(`Dashboard running at http://localhost:${PORT}`));
