# OnlyFats Frontend

React + Vite + Tailwind frontend starter connected to:

`https://onlyfats-backend-177204163721.asia-south1.run.app`

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

`http://localhost:5173`

## Important
Your FastAPI backend should allow CORS for:

- http://localhost:5173
- http://127.0.0.1:5173

## Auth endpoints used

- POST `/auth/signup`
- POST `/auth/login`
- POST `/auth/guest`
- POST `/auth/refresh`
- POST `/auth/logout`
- GET `/auth/me`
