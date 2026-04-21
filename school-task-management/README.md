# School Staff Task Management

A monorepo for a school staff task management platform with a React frontend and an Express API backend.

## Project Structure

```text
school-task-management/
  frontend/   Vite + React 18 + TypeScript client
  backend/    Node.js + Express + TypeScript API
```

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL
- Redis

## Setup

1. Install dependencies for each app:

   ```bash
   cd frontend
   npm install

   cd ../backend
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your MySQL, Redis, JWT, SMTP, and frontend URL values.

## Scripts

### Frontend

```bash
npm run dev      # start Vite dev server
npm run build    # type-check and build production assets
npm run preview  # preview production build
```

### Backend

```bash
npm run dev      # start API in watch mode with ts-node
npm run build    # compile TypeScript to dist
npm start        # run compiled API
```

## Default Ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
