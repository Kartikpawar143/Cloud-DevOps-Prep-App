# Cloud & DevOps Interview Prep — Local Setup Guide

Complete instructions to run this application on your local machine.

---

## Prerequisites

Choose one of the following setups:

### Option A: Local Development (without Docker)

- [Node.js](https://nodejs.org/) v18 or later
- [Bun](https://bun.sh/) (recommended) or npm
- Git

### Option B: Docker

- [Docker](https://docs.docker.com/get-docker/) v20+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

---

## 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

## 2. Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Contents of `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://cqtmwhphfiwupuavrayk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> Default values are pre-configured and ready to use out of the box.

---

## Running Locally (Without Docker)

### Install Dependencies

```bash
bun install
```

### Start Web Preview

```bash
bunx expo start --web
```

Open **http://localhost:8081** in your browser.

### Start for Mobile (Expo Go)

```bash
bunx expo start
```

Scan the QR code with:
- **iOS**: [Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Start with Tunnel (devices on different networks)

```bash
bunx expo start --tunnel
```

---

## Running with Docker

### Build and Start

```bash
docker compose up --build
```

This will:
1. Build the Docker image with all dependencies
2. Start the Expo development server
3. Serve the web version at **http://localhost:8081**

### Run in Background (detached)

```bash
docker compose up --build -d
```

### View Logs

```bash
docker compose logs -f app
```

### Stop Containers

```bash
docker compose down
```

### Full Rebuild (after dependency changes)

```bash
docker compose down
docker compose up --build
```

> **Hot Reload**: Your local source code is mounted as a volume, so code changes reflect instantly. Only `node_modules` live inside the container.

---

## Project Structure

```
app/                            # Screens (Expo Router)
  (tabs)/                       # Tab navigation
    _layout.tsx                 # Tab bar config
    index.tsx                   # Home dashboard
    modules.tsx                 # Module listing + search
    bookmarks.tsx               # Saved questions
    profile.tsx                 # User profile
  module/[moduleId].tsx         # Module detail
  question/[id].tsx             # Question detail
  add-question.tsx              # Add user questions
  case-studies.tsx              # Architecture case studies
  create-module.tsx             # Create custom modules
  login.tsx                     # Auth screen
  mock-interview.tsx            # Timed mock interviews
constants/                      # Colors & theme
contexts/                       # Auth & Data providers
data/                           # Static questions & modules
lib/supabase.ts                 # Supabase client
types/index.ts                  # TypeScript definitions
Dockerfile                      # Docker image
docker-compose.yml              # Docker orchestration
.env.example                    # Env variable template
```

---

## Available Commands

| Command | Description |
|---|---|
| `bunx expo start` | Start dev server (mobile) |
| `bunx expo start --web` | Start web preview |
| `bunx expo start --tunnel` | Tunnel for remote devices |
| `bunx expo start --clear` | Start with cleared cache |
| `docker compose up --build` | Build & run via Docker |
| `docker compose down` | Stop Docker containers |

---

## Troubleshooting

### App not loading on device?
1. Phone and computer must be on the same WiFi
2. Try tunnel mode: `bunx expo start --tunnel`
3. Open ports: `8081`, `19000`, `19001`, `19002`

### Docker issues?
1. Check Docker is running: `docker info`
2. View logs: `docker compose logs -f`
3. Rebuild: `docker compose down && docker compose up --build`
4. Port conflict? Stop services on port 8081

### Dependency issues?
```bash
rm -rf node_modules
bun install
bunx expo start --clear
```

### Web preview blank?
1. Clear browser cache
2. Try incognito window
3. Check browser console for errors

---

## Testing on Devices

| Platform | App | How |
|---|---|---|
| iOS | Expo Go | Scan QR from terminal |
| Android | Expo Go | Scan QR from terminal |
| Web | Browser | http://localhost:8081 |
