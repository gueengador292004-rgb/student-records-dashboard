# Student Records Dashboard (CRUD)

Dashboard application with full CRUD built with **Express.js** and **SQLite** (better-sqlite3).

## Features
- Dashboard cards: total students, average grade, top grade, at-risk count (grade below 75)
- Create, Read, Update, Delete students
- Search by name or course

## Setup
```bash
npm install
npm start
```
Open http://localhost:3000 (`students.db` is created automatically).

## API
| Method | Endpoint            | Description     |
|--------|---------------------|-----------------|
| GET    | /api/students?q=    | List / search   |
| GET    | /api/students/:id   | Get one         |
| POST   | /api/students       | Create          |
| PUT    | /api/students/:id   | Update          |
| DELETE | /api/students/:id   | Delete          |
| GET    | /api/stats          | Dashboard stats |
