# Taiwan Weather GIS Web

[English](README.md) | **繁體中文**

[![CI](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-twsky.vercel.app-000000?logo=vercel&logoColor=white)](https://twsky.vercel.app/)
[![Release](https://img.shields.io/badge/release-v1.0.0-2563eb)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

以中央氣象署（CWA）Open Data 為資料來源的台灣氣象 GIS。  
專案使用 PowerShell + SQLite 建立資料管線，前端採用 Vite + TypeScript + Leaflet，並透過 GitHub Actions 執行自動化驗證。

**Live Demo：** https://twsky.vercel.app/

## 專案特色

- 使用真實 CWA Open Data（`O-A0003-001`）
- PowerShell ETL + SQLite 資料層
- 以 Static JSON 作為資料處理層與 Browser 之間的邊界
- Leaflet 互動式溫度、濕度與天氣圖層
- Five-Gate 驗證流程、CI 與 Vercel Deployment
- 排程更新氣象資料

## 系統架構

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

需要 **Node.js 20.x**。

```bash
git clone https://github.com/wupojung/AIoT_L3_CWA_HW1.git
cd AIoT_L3_CWA_HW1/web
npm ci
npm run dev
```

完整資料管線、環境變數、測試與 Production Build 請參考 [詳細啟動指南](docs/getting-started.zh-TW.md)。

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

詳細資訊請參考 [Technology Stack](docs/tech_stack.md) 與 [Technology Decisions](docs/technology-decisions.md)。

## Development Status

| Gate | Status | Evidence |
| --- | :---: | --- |
| Gate 1 — CWA API | ✅ PASS | [Verification](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate1-api.yml) |
| Gate 2 — ETL & SQLite | ✅ PASS | [Verification](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate2-integration.yml) |
| Gate 3 — Taiwan GIS Web | ✅ PASS | [Verification](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate3-gis.yml) |
| Gate 4 — GitHub & Continuous Integration | ✅ PASS | [Verification](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate4-quality.yml) |
| Gate 5 — Vercel Deployment | ✅ PASS | [Production](https://twsky.vercel.app/) |

## 版本規劃

| Version | Direction | Status |
| --- | --- | --- |
| **v1.0.0** | CARTO Dark / Light baseline | Current |
| **v1.1.0** | 完整 O-A0003 觀測資料模型 + 英文／繁中 GIS UI | Next |
| **v1.2.0** | CARTO no-label + 自製繁體中文標籤 | Planned |
| **v1.3.0** | MapTiler Dark + Traditional Chinese labels | Planned |

下一階段請參考 [v1.1.0 開發規劃](docs/releases/v1.1.0.zh-TW.md)，版本歷史請參考 [CHANGELOG.md](CHANGELOG.md)。

## 文件

- [詳細啟動指南](docs/getting-started.zh-TW.md)
- [v1.1.0 開發規劃](docs/releases/v1.1.0.zh-TW.md)
- [Architecture](docs/architecture.md)
- [Technology Stack](docs/tech_stack.md)
- [Testing Strategy](docs/testing.md)
- [Five-Gate Workflow](myplan/workflow.md)
- [Technology Decisions](docs/technology-decisions.md)
- [Changelog](CHANGELOG.md)

## License

本專案自行撰寫的程式碼與文件採用 [MIT License](LICENSE)。

CWA Open Data、CARTO / OpenStreetMap 內容與第三方套件仍受各自的授權條款約束。
