# 🎬 Media Tracker

Track movies, shows, games, and books — all in one place.  
Rate, review, and follow your friends’ activity in real time.  

![Media Tracker preview](frontend/public/preview.png)

Live demo: **[media-tracker-z9lf.vercel.app](https://media-tracker-z9lf.vercel.app/)**  

---

![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## ✨ Features

**Social**
- 👥 Friends system — add friends and see their reviews in your feed  
- 🧑‍💻 Auto-seeded admin account (“Mohamed”) for first-time users  

**Media Management**
- ⭐ Rate and review movies, shows, games, and books  
- 🔎 Smart autocomplete search (TMDB, RAWG, Google Books/OpenLibrary)

**Technical**
- 🔐 JWT authentication (access + refresh)  
- ⚡ Redis caching for faster search and feed loading  
- 🐘 PostgreSQL + Flyway migrations  
- 🐳 Docker-ready for local or production use  

---

## 🛠️ Tech Stack

**Backend**
- Java 21 + Spring Boot 3.5  
- Spring Security (JWT, BCrypt)  
- PostgreSQL (persistence)  
- Redis (caching)  
- Flyway (DB migrations)  
- Docker-ready (Gradle multi-stage build)

**Frontend**
- Next.js 15 (React 19 + TypeScript)  
- TailwindCSS 4  
- Vercel for hosting  

**APIs Integrated**
- TMDB (movies/shows)  
- RAWG (games)  
- Google Books / OpenLibrary (books)

---

## ⚙️ Setup (Development)

```bash
# Backend
cd backend/media-tracker-api
./gradlew bootRun

# Frontend
cd frontend
npm install
npm run dev
```

Create a `.env` file in each directory with the following:

```
JWT_SECRET=your_secret
POSTGRES_URL=your_url
REDIS_URL=your_url
TMDB_API_KEY=your_key
RAWG_API_KEY=your_key
```

---

## 🐳 Run with Docker

```bash
docker compose up --build
```

App will be available at:
- Frontend → http://localhost:3000  
- Backend → http://localhost:8080  

---

## 🌐 Deployment

- **Backend** → Render (Dockerized Spring Boot API)  
- **Frontend** → Vercel (Next.js app)  
- Environment variables configure API URLs, DB credentials, JWT secrets, and external API keys.  

---

## 📂 Repository Structure

```
.
├── backend/               # Spring Boot API
│   └── media-tracker-api/
└── frontend/              # Next.js app
```

---

## 📌 API Overview

- `POST /api/auth/register` → register new user  
- `POST /api/auth/login` → log in and get tokens  
- `GET /api/health` → health check  
- `GET /api/search?kind=MOVIE|SHOW|GAME|BOOK&q=...` → search external APIs  
- `POST /api/reviews` → add a review (auth)  
- `GET /api/feed` → see friends’ activity (auth)  
- `GET /api/friends` → manage friends (auth)  
- `GET /api/users/me` → get current user info (auth)  

---

## 📜 License
MIT © Mohamed Adem
