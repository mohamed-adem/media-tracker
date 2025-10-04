# 🎬 Media Tracker

Track movies, TV shows, games, and books — rate and review them, and see your friends’ activity in one place.

🔗 **Live Demo:** [media-tracker-z9lf.vercel.app](https://media-tracker-z9lf.vercel.app)

---

## ✨ Features

- 🔐 **Authentication** — secure login & signup using JWT (access + refresh tokens)
- 🧑‍🤝‍🧑 **Friends system** — add friends and see their media activity
- ⭐ **Ratings & reviews** — rate and optionally review what you watch, play, or read
- 🔎 **Smart search with autocomplete + posters**
  - Movies & TV → [TMDB API](https://www.themoviedb.org/documentation/api)
  - Games → [RAWG API](https://rawg.io/apidocs)
  - Books → [Google Books API](https://developers.google.com/books) / [OpenLibrary Covers](https://openlibrary.org/dev/docs/api/covers)
- ⚡ **Caching** — Redis-backed Spring Cache for fast lookups
- 🧑‍💻 **Seeder** — auto-creates an admin user (`Mohamed`) on first boot; new users automatically friend Mohamed
- 🧱 **Docker-ready** — full multi-stage Gradle build for container deployment

---

## 🧠 Tech Stack

### 🖥️ Backend
- **Java 21 + Spring Boot 3.5**
- Spring Security (JWT, BCrypt)
- PostgreSQL (data persistence)
- Redis (caching)
- Flyway (database migrations)
- Dockerized with Gradle

### 💻 Frontend
- **Next.js 15 (React 19 + TypeScript)**
- TailwindCSS 4
- Hosted on **Vercel**

---

## ⚙️ APIs Integrated

| Type | API | Description |
|------|-----|-------------|
| 🎥 Movies/Shows | TMDB | Search titles, posters, and metadata |
| 🎮 Games | RAWG | Fetch games, genres, and cover art |
| 📚 Books | Google Books / OpenLibrary | Search and fetch book data |

---

## 🗂️ Repository Structure

