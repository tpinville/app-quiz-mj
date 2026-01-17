# Full-Stack React + Node.js + SQLite

A full-stack web application with React frontend, Node.js/Express backend, and SQLite database.

## Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Containerization**: Docker Compose

## Quick Start

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | Get all items |
| POST | /api/items | Create item |
| DELETE | /api/items/:id | Delete item |

## Development

### Without Docker

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
.
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── backend/
    ├── Dockerfile
    ├── src/
    │   ├── index.js
    │   └── database.js
    └── package.json
```
