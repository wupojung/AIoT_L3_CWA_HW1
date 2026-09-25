# Getting Started

[English](getting-started.md) | [繁體中文](getting-started.zh-TW.md)

This guide covers local frontend development, the full CWA data pipeline, testing, and production builds.

## 1. Requirements

### Frontend only

- Git
- Node.js 20.x
- npm

### Full data pipeline

- Windows 10 / 11
- PowerShell 7+ recommended
- Pester 6.2.0
- CWA API key
- Node.js 20.x

The current SQLite helper uses Windows `winsqlite3.dll`, so the full ETL pipeline is currently Windows-oriented.

## 2. Clone the Repository

```bash
git clone https://github.com/wupojung/AIoT_L3_CWA_HW1.git
cd AIoT_L3_CWA_HW1
```

## 3. Frontend Preview

The repository already contains `web/public/weather.json`, so the GIS can run without calling the CWA API.

```bash
cd web
npm ci
npm run dev
```

Vite will print the local development URL, typically:

```text
http://localhost:5173
```

### Optional CARTO basemap key

Without a CARTO key, the current implementation falls back to OpenStreetMap.

For CARTO Dark / Light locally:

```powershell
cd web
Copy-Item .env.example .env
```

Then set:

```env
VITE_CARTO_API_KEY=<YOUR_CARTO_API_KEY>
```

`VITE_` variables are client-side values and are visible in the browser bundle. Configure provider-side domain / referrer restrictions where available.

## 4. Full CWA → SQLite → JSON Pipeline

### 4.1 Configure the CWA API key

From the repository root:

```powershell
Copy-Item .env.example .env
```

Set:

```env
CWA_API_KEY=<YOUR_CWA_API_KEY>
```

The root `.env` is used by `src/Run-Etl.ps1`.

### 4.2 Run ETL

```powershell
./src/Run-Etl.ps1
```

Expected output:

```text
data/weather.db
```

### 4.3 Export frontend JSON

```powershell
./src/Export-WeatherJson.ps1
```

Expected output:

```text
web/public/weather.json
```

### 4.4 Start the frontend

```powershell
cd web
npm ci
npm run dev
```

## 5. Testing

### PowerShell / Data Layer

Install the pinned Pester version:

```powershell
Install-Module Pester -RequiredVersion 6.2.0 -Scope CurrentUser -Force
Import-Module Pester -RequiredVersion 6.2.0 -Force
```

Run the full PowerShell test suite:

```powershell
Invoke-Pester -Path ./tests -Output Detailed
```

CI-compatible mode:

```powershell
Invoke-Pester -Path ./tests -CI -Output Detailed
```

### Frontend

From `web/`:

```bash
npm ci
npx tsc --noEmit
npm run test -- --run
npm run build
```

## 6. Production Build

```bash
cd web
npm ci
npm run build
```

Build output:

```text
web/dist/
```

Key artifacts:

```text
web/dist/index.html
web/dist/weather.json
```

Preview the production build locally:

```bash
npm run preview
```

## 7. Environment Files

| File | Purpose |
| --- | --- |
| `/.env` | Local CWA ETL secret |
| `/.env.example` | CWA environment template |
| `/web/.env` | Local Vite / CARTO configuration |
| `/web/.env.example` | Frontend environment template |

Real `.env` files must never be committed.

## 8. Useful References

- [README](../README.md)
- [Architecture](architecture.md)
- [Technology Stack](tech_stack.md)
- [Testing Strategy](testing.md)
- [Five-Gate Workflow](../myplan/workflow.md)
