# Media Tracker

Track movies, TV shows, games, and books; rate and review them; and see your friends’ activity in one place.  
Live demo: **[media-tracker-z9lf.vercel.app](https://media-tracker-z9lf.vercel.app/)**  

---

## ✨ Features
- 🔐 **Authentication** — secure login & signup with JWT (access + refresh tokens)  
- 🧑‍🤝‍🧑 **Friends system** — add friends and see their media activity  
- ⭐ **Ratings & reviews** — rate what you watch, play, or read, and write optional reviews  
- 🔎 **Smart search with autocomplete + posters**  
  - Movies & Shows → [TMDB API](https://developer.themoviedb.org/)  
  - Games → [RAWG API](https://rawg.io/apidocs)  
  - Books → [Google Books API](https://developers.google.com/books) / OpenLibrary covers  
- 🧱 **Caching** — Redis-backed Spring Cache for speed  
- 🧑‍💻 **Seeder** — auto-creates an admin “Mohamed” account on first boot; new users automatically friend Mohamed  

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
