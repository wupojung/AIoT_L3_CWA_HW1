# Taiwan Weather GIS Web

**English** | [繁體中文](README.zh-TW.md)

[![CI](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-twsky.vercel.app-000000?logo=vercel&logoColor=white)](https://twsky.vercel.app/)
[![Release](https://img.shields.io/badge/release-v1.0.0-2563eb)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

A Taiwan weather GIS that visualizes current observations from the Central Weather Administration (CWA).  
The project uses a PowerShell + SQLite data pipeline and a Vite + TypeScript + Leaflet frontend, with automated verification through GitHub Actions.

**Live Demo:** https://twsky.vercel.app/

## System Preview

[![TW Sky system preview](docs/assets/tw-sky-system-preview.webp)](https://twsky.vercel.app/)


## Highlights

- Real CWA Open Data (`O-A0003-001`)
- PowerShell ETL with SQLite persistence
- Static JSON boundary between data processing and the browser
- Interactive Leaflet layers for temperature, humidity, and weather conditions
- Five-Gate verification model with CI and Vercel deployment
- Scheduled weather data refresh

## Architecture

```text
CWA Open Data
    ↓
PowerShell API Client / ETL
    ↓
SQLite
    ↓
weather.json
    ↓
Vite + TypeScript + Leaflet
    ↓
Vercel
```

## Quick Start

Requires **Node.js 20.x**.

```bash
git clone https://github.com/wupojung/AIoT_L3_CWA_HW1.git
cd AIoT_L3_CWA_HW1/web
npm ci
npm run dev
```

For the full data pipeline, environment variables, testing, and production build instructions, see [Getting Started](docs/getting-started.md).

## Technology Stack

| Area | Technology |
| --- | --- |
| Data Source | CWA Open Data |
| Data / ETL | PowerShell |
| Database | SQLite |
| Frontend | Vite + TypeScript |
| GIS | Leaflet |
| Basemap | CARTO Raster |
| Testing | Pester 6.2.0 + Vitest |
| CI | GitHub Actions |
| Deployment | Vercel |

See [Technology Stack](docs/tech_stack.md) and [Technology Decisions](docs/technology-decisions.md) for details.

## Development Status

| Gate | Status | Evidence |
| --- | :---: | --- |
| Gate 1 — CWA API | ✅ PASS | [Verification](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate1-api.yml) |
| Gate 2 — ETL & SQLite | ✅ PASS | [Verification](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate2-integration.yml) |
| Gate 3 — Taiwan GIS Web | ✅ PASS | [Verification](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate3-gis.yml) |
| Gate 4 — GitHub & Continuous Integration | ✅ PASS | [Verification](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate4-quality.yml) |
| Gate 5 — Vercel Deployment | ✅ PASS | [Production](https://twsky.vercel.app/) |

## Release Roadmap

| Version | Direction | Status |
| --- | --- | --- |
| **v1.0.0** | CARTO Dark / Light baseline | Current |
| **v1.1.0** | Complete O-A0003 observation model + bilingual GIS UI | Next |
| **v1.2.0** | CARTO no-label + custom Traditional Chinese labels | Planned |
| **v1.3.0** | MapTiler Dark + Traditional Chinese labels | Planned |

See [v1.1.0 Release Plan](docs/releases/v1.1.0.md) for the next development cycle and [CHANGELOG.md](CHANGELOG.md) for release history.

## Documentation

- [Getting Started](docs/getting-started.md)
- [v1.1.0 Release Plan](docs/releases/v1.1.0.md)
- [Architecture](docs/architecture.md)
- [Technology Stack](docs/tech_stack.md)
- [Testing Strategy](docs/testing.md)
- [Five-Gate Workflow](myplan/workflow.md)
- [Technology Decisions](docs/technology-decisions.md)
- [Changelog](CHANGELOG.md)

## License

Project-owned source code and documentation are licensed under the [MIT License](LICENSE).

CWA Open Data, CARTO / OpenStreetMap content, and third-party packages remain subject to their respective licenses and terms.
