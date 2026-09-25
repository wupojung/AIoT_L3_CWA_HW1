# Technology Stack

Current baseline: **v1.0.0**

This document describes the technology used by the current release. Historical rationale and rejected alternatives are recorded in [Technology Decisions](technology-decisions.md).

## Runtime and Data Pipeline

| Area | Technology | Notes |
| --- | --- | --- |
| Data Source | CWA Open Data | Dataset `O-A0003-001` |
| ETL | PowerShell | API request, parsing, transformation, export |
| Database | SQLite | Local persistence / integration boundary |
| Data Contract | Static JSON | `web/public/weather.json` |
| Full Pipeline OS | Windows | Current helper uses `winsqlite3.dll` |

## Frontend

| Area | Technology | Notes |
| --- | --- | --- |
| Runtime / Toolchain | Node.js 20 | Matches CI |
| Build Tool | Vite 5 | Static production build |
| Language | TypeScript 5 | Frontend application code |
| GIS | Leaflet 1.9 | Map and data layers |
| Basemap | CARTO Raster | Dark / Light in v1.0.0 |
| Frontend Tests | Vitest 1.x | Application logic |

## Quality and Delivery

| Area | Technology |
| --- | --- |
| PowerShell Tests | Pester 6.2.0 |
| CI | GitHub Actions |
| Deployment | Vercel |
| License | MIT |

## Environment Scope

Environment variables are separated by runtime:

```text
Repository root
└── .env
    └── CWA_API_KEY

web/
└── .env
    └── VITE_CARTO_API_KEY
```

`CWA_API_KEY` is a secret and must not enter the browser.

`VITE_CARTO_API_KEY` is client-side configuration and is visible in the browser bundle. Use provider-side domain / referrer restrictions where available.

## Version Roadmap

### v1.1.0

```text
Expanded O-A0003 parser / SQLite / JSON contract
+
English / Traditional Chinese product UI
+
Additional GIS metric layers
```

v1.1 changes the parser contract and re-enters verification from Gate 1.

### v1.2.0

```text
Leaflet
+
CARTO no-label raster
+
Custom Taiwan Traditional Chinese labels
```

### v1.3.0

```text
Leaflet
+
MapTiler Dark / Dataviz Dark
+
Traditional Chinese labels
```

v1.2 and v1.3 affect the GIS layer and re-enter verification from Gate 3.

## Historical Note

Early Gate 1 experiments used the built-in Windows PowerShell / Pester environment available at that time. The final v1.0.0 baseline standardized on **Pester 6.2.0**, **Node.js 20**, and the current Five-Gate CI model.
