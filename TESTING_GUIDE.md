# Uputstvo za pokretanje projekta (testiranje)

Ovo uputstvo pokriva pokretanje baze, backend-a u test rezimu i frontend-a, kao i osnovne testove.

## Preduslovi

- .NET SDK (verzija kompatibilna sa resenjem)
- Node.js + npm
- Docker Desktop (za MongoDB)

## Fajlovi koji nisu na gitu

Pre pokretanja dodati sledece fajlove:

- client/.env.local (sadrzi Vite i Firebase konfiguraciju)
- client/test_scripts/serviceAccountKey.json (Firebase service account)

Fajlove treba dodati lokalno (ne ulaze u git).

## 1) Pokretanje baze (MongoDB)

Iz root foldera projekta:

```powershell
docker-compose up -d
```

MongoDB ce slusati na portu 27017, a mongo-express na 8081.

## 2) Pokretanje backend-a u test rezimu

Iz foldera server/Backend.API:

```powershell
$env:ASPNETCORE_ENVIRONMENT="Test"
dotnet run --no-launch-profile --project .\Backend.API.csproj
```

Ovo je obavezno kada se backend testira iz frontend-a.

## 3) Pokretanje frontend-a

Iz foldera client:

```powershell
npm install
npm run dev
```

Frontend koristi vrednosti iz client/.env.local.

## 4) Pokretanje testova (opciono)

### Backend testovi

Iz foldera server:

```powershell
dotnet test
```

### Frontend (Playwright) testovi

Iz foldera client:

```powershell
npx playwright install
npx playwright test
```
