# EngPersona (Node.js)

Migrasi dari Laravel ke Node.js (Express + EJS + sql.js).

## Jalankan

```bash
npm install
npm start
```

Aplikasi berjalan di `http://localhost:3000`.

## Data

Database menggunakan file SQLite: `data/database.sqlite`.

## Struktur

- `frontend/views`: EJS dan layout.
- `frontend/public`: aset browser.
- `backend/src`: modul backend baru (API, controller, repository, resource, dan utilitas).
- `src/app.js`: entry point web yang sedang mempertahankan seluruh route EJS lama selama migrasi ke layer `backend/src` dilakukan bertahap.

## API

API berbasis session tersedia di prefix `/api/v1`. Login dahulu melalui aplikasi, lalu gunakan:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `PATCH /api/v1/me/playlist`
- `GET /api/v1/results`
- `GET /api/v1/results/latest`
- `GET /api/v1/questions?difficulty=easy&stage=1`

Login API mengembalikan JWT access token (15 menit secara default). Refresh token disimpan sebagai cookie `HttpOnly` dan dapat dicabut melalui endpoint logout.
