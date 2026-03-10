# 🎬 Media Tracker

**Track movies, shows, games, and books — all in one place.**  
Rate, review, and follow your friends’ activity in real time.

![Media Tracker preview](frontend/public/preview.png)

### 🚀 Live Demo: **[media-tracker-z9lf.vercel.app](https://media-tracker-z9lf.vercel.app/)**

---

![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Key Features

### **Social**
- 👥 **Friends System** — Add friends, view profiles, and see their reviews in your feed. New users are automatically friends with the admin ("Mohamed") to see content immediately.
- � **Activity Feed** — Real-time updates when friends rate or review content.

### **Media Management**
- ⭐ **Universal Rating System** — Review movies, TV shows, video games, and books with a consistent 5-star scale.
- 🔎 **Smart Search** — Unified search powered by multiple external APIs:
    - **TMDB** (Movies & TV)
    - **RAWG** (Video Games)
    - **Google Books / OpenLibrary** (Books)

### **Technical Highlights**
- 🔐 **Stateless Authentication** — Secure JWT implementation (Access + Refresh tokens).
- ⚡ **Performance Optimized** — Redis caching for API responses and feed generation.
- 🐘 **Robust Persistence** — PostgreSQL with Flyway for versioned database migrations.
- 🕒 **Keep-Alive Architecture** — Automated GitHub Action prevents free-tier server sleep.

---

## 🛠️ Tech Stack

### **Backend**
- **Language:** Java 21 (Eclipse Temurin)
- **Framework:** Spring Boot 3.5
- **Database:** PostgreSQL
- **Caching:** Redis
- **Security:** Spring Security, IO JSON Web Token (jjwt), BCrypt
- **Build Tool:** Gradle (Kotlin DSL)
- **Containerization:** Docker (Multi-stage build)

### **Frontend**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **State/Fetching:** SWR

---

## ⚙️ Configuration (Environment Variables)

The application requires the following environment variables.

### **Backend (`application.yml` / Render Environment)**

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC Connection String | `jdbc:postgresql://host:5432/db?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Database User | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database Password | `securePassword` |
| `SPRING_DATA_REDIS_HOST` | Redis Host | `red-xxxx.render.com` |
| `JWT_SECRET` | Secret for signing tokens (32+ chars) | `mySuperSecretKey123!` |
| `TMDB_API_KEY` | API Key from The Movie DB | `eyJ...` |
| `RAWG_API_KEY` | API Key from RAWG.io | `4daa...` |
| `APP_SEED_MOHAMEDEMAIL` | Email for default admin user | `admin@example.com` |
| `APP_SEED_MOHAMEDPASSWORD` | Password for default admin | `AdminPass123` |

### **Frontend (`.env.local`)**

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL of the backend API (e.g., `https://media-tracker-api.onrender.com`) |

---

## 🚀 Getting Started

### **Option 1: Docker Compose (Recommended)**
Run the entire stack (Database, Redis, Backend) locally.

```bash
docker compose up --build
```
*   Backend: [http://localhost:8080](http://localhost:8080)
*   Frontend: [http://localhost:3000](http://localhost:3000)

### **Option 2: Manual Setup**

**1. Backend**
```bash
cd backend/media-tracker-api
# Ensure PostgreSQL and Redis are running locally
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

The project is deployed using a modern CI/CD approach:

1.  **Backend (Render):**
    - Deployed via Docker container.
    - Optimized for free tier (Lazy Initialization enabled).
    - **Auto-Ping:** A GitHub Action (`keep-alive.yml`) pings `/api/health` every 14 minutes to prevent the instance from spinning down.

2.  **Frontend (Vercel):**
    - Connects to the Render backend via `NEXT_PUBLIC_API_URL`.
    - Automatic deployments on Git push.

---

## 📜 License
MIT © Mohamed Adem
