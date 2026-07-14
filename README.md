# 🎬 Media Tracker

**Track movies, shows, games, and books — all in one place.**  
Rate, review, and follow your friends’ activity from one personal library.

### 🚀 Live Demo: **[media-tracker-z9lf.vercel.app](https://media-tracker-z9lf.vercel.app/)**

---

![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Key Features

### **Social**
- 👥 **Friends System** — Add friends, view profiles, and see their reviews in your feed. Local/demo environments can optionally connect new users to a configured seed account.
- 📰 **Activity Feed** — See recent ratings and reviews from accepted friends.
- 🔔 **In-App Alerts** — Receive and manage notifications when friend requests are sent or accepted.

### **Media Management**
- 📌 **Library Lifecycle** — Save media before reviewing it, then track it as planned, in progress, completed, paused, or dropped.
- 📈 **Progress & Privacy** — Record fractional progress and keep individual library entries out of friends' feeds.
- ⭐ **Universal Rating System** — Add and edit half-star reviews for movies, TV shows, video games, and books with a consistent 5-star scale.
- 🧹 **Collection Maintenance** — Update status, progress, and privacy inline or remove an entry and its review together.
- ☷ **Custom Lists** — Build private or shared collections, reorder titles, and save a note on each item.
- 🗂️ **Media Details** — Manage your library entry, add or remove the title from lists, and read public reviews from accepted friends.
- ✦ **Suggestions From Friends** — Find highly rated media from accepted friends while excluding items already owned.
- 🔎 **Unified Search** — Search multiple external catalogs from one place:
    - **TMDB** (Movies & TV)
    - **RAWG** (Video Games)
    - **OpenLibrary** (Books)

### **Technical Highlights**
- 🔐 **Stateless Authentication** — JWT access and refresh tokens with BCrypt password hashing.
- 🐘 **Versioned Persistence** — PostgreSQL with fourteen Flyway database migrations, including tested backfills and referential-integrity constraints.
- ⚡ **Resilient Provider Search** — Parallel provider calls use connection/response timeouts, bounded retry, partial-failure isolation, and Redis-backed response caching.
- 🕒 **Keep-Alive Architecture** — Automated GitHub Action prevents free-tier server sleep.
- ✅ **Continuous Verification** — A GitHub Actions workflow is configured for backend tests, frontend lint/type checks/build, and a container build.

---

## 🛠️ Tech Stack

### **Backend**
- **Language:** Java 21 (Eclipse Temurin)
- **Framework:** Spring Boot 3.5
- **Database:** PostgreSQL
- **Caching:** Redis-backed provider search cache with a 15-minute TTL and graceful cache-failure fallback
- **Security:** Spring Security, IO JSON Web Token (jjwt), BCrypt
- **Build Tool:** Gradle (Kotlin DSL)
- **Containerization:** Docker (Multi-stage build)

### **Frontend**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **State/Fetching:** React client state and Fetch API

---

## ⚙️ Configuration (Environment Variables)

The application requires the following environment variables.

### **Backend (`application.yml` / Render Environment)**

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC Connection String | `jdbc:postgresql://host:5432/db?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Database User | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database Password | `securePassword` |
| `CACHE_TYPE` | Cache backend (`redis` for Redis, `simple` for no-Redis local/dev runs) | `redis` |
| `SPRING_DATA_REDIS_HOST` | Redis Host | `red-xxxx.render.com` |
| `SPRING_DATA_REDIS_PORT` | Redis Port | `6379` |
| `JWT_SECRET` | Secret for signing tokens (32+ chars) | `mySuperSecretKey123!` |
| `TMDB_API_KEY` | API Key from The Movie DB | `eyJ...` |
| `RAWG_API_KEY` | API Key from RAWG.io | `4daa...` |
| `APP_SEED_MOHAMEDEMAIL` | Email for default admin user | `admin@example.com` |
| `APP_SEED_MOHAMEDPASSWORD` | Password for default admin | `AdminPass123` |
| `APP_SEED_ENABLED` | Opt in to creating the development seed admin | `false` |
| `APP_SEED_RESET_ON_START` | Opt in to resetting the seed password at startup | `false` |

### **Frontend (`.env.local`)**

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL of the backend API (e.g., `https://media-tracker-api.onrender.com`) |

---

## 🚀 Getting Started

### **Option 1: Start local infrastructure**
Run PostgreSQL and Redis locally with Docker Compose.

```bash
docker compose up --build
```
Then start the backend and frontend using the manual commands below.

### **Option 2: Manual Setup**

**1. Backend**
```bash
cd backend/media-tracker-api
# Ensure PostgreSQL and Redis are running locally, or set CACHE_TYPE=simple for a no-Redis development run
./gradlew bootRun
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment Architecture

The public demo uses the following deployment setup:

1.  **Backend (Render):**
    - Deployed via Docker container.
    - Optimized for free tier (Lazy Initialization enabled).
    - A GitHub Action (`keep-alive.yml`) checks `/api/health` every 14 minutes.

2.  **Frontend (Vercel):**
    - Connects to the Render backend via `NEXT_PUBLIC_API_URL`.
    - Serves the Next.js frontend and connects through `NEXT_PUBLIC_API_URL`.

---

## 📜 License
MIT © Mohamed Adem
