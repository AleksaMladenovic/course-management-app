# Course Management App

Aplikacija za upravljanje kursevima sa mogućnošću kreiranja, pregledanja i upravljanja lekcijama.

## 🔧 Pre-requisiti

- **Node.js** (verzija 18+)
- **.NET SDK** (verzija 8+)
- **MongoDB** (lokalno ili preko Docker-a)
- **Docker** i **Docker Compose** (opciono)

## 📝 Setup

### Postavite `.env.local` fajl

Postavite `.env.local` u direktorijum `client/` (biće poslat posebnom porukom)

```
client/.env.local
```

## 🚀 Pokretanje

### Korak 1: Pokrenite MongoDB

Korišćenjem Docker-a:
```bash
docker-compose up -d mongo
```

Ili ako imate MongoDB lokalno:
```bash
mongod
```

### Korak 2: Pokrenite Backend

```bash
cd server/Backend.API
dotnet restore
dotnet run
```

Backend pokrenut na: `http://localhost:5196`

### Korak 3: Pokrenite Frontend

```bash
cd client
npm install
npm run dev
```

Frontend pokrenut na: `http://localhost:5173`

---

**Status**: Development
