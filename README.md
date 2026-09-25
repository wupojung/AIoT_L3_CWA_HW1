# Taiwan Weather GIS Web

[![CI](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-twsky.vercel.app-000000?logo=vercel&logoColor=white)](https://twsky.vercel.app/)
[![Release](https://img.shields.io/badge/release-v1.0.0-2563eb)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)

以中央氣象署（CWA）Open Data 為資料來源的 Taiwan Weather GIS Web。  
專案採用 **PowerShell + SQLite** 建立資料管線，並以 **Vite + TypeScript + Leaflet** 建立前端 GIS，搭配 **Pester、Vitest 與 GitHub Actions** 提供可重複驗證的開發流程。

> `main` branch 的整體健康狀態由 GitHub Actions 持續驗證；各 Gate 的完成狀態與驗證證據集中在 [Development Status](#development-status)。


## Current Release

| Item | Status |
| --- | --- |
| Version | **v1.0.0** |
| Release Date | 2026-09-25 |
| Production | [twsky.vercel.app](https://twsky.vercel.app/) |
| Release History | [CHANGELOG.md](CHANGELOG.md) |
| Technology Decisions | [docs/technology-decisions.md](docs/technology-decisions.md) |

v1.0.0 是目前第一個完整 baseline release：資料管線、GIS frontend、CI、Gate verification 與 Vercel deployment 均已建立。

後續版本會持續完善 GIS 體驗；新版本若影響既有 Gate，會從「最早受影響 Gate」重新執行驗證，而不是假設舊版 PASS 自動延續。

---

## Overview

本專案的核心資料流程：

~~~text
CWA Open Data
    ↓
PowerShell API Client / Parser
    ↓
ETL
    ↓
SQLite
    ↓
Static weather.json
    ↓
Vite + TypeScript
    ↓
Leaflet Taiwan GIS
    ↓
GitHub Actions
    ↓
Vercel
~~~

目前使用的 CWA dataset 為：

~~~text
O-A0003-001
~~~

此資料屬於 **Current Weather Observation（目前天氣觀測）**，不是 forecast data。

### Project Goals

- 使用真實 CWA Open Data。
- 不在前端暴露 CWA API Key。
- 以 SQLite 建立可驗證、可重建的資料層。
- 將 SQLite 資料輸出為 frontend-friendly JSON。
- 以 Leaflet 呈現台灣氣象測站資訊。
- 建立可在 clean checkout 中重現的 automated tests。
- 使用 GitHub Actions 提供 Gate verification 與 overall CI。
- 最終部署至 Vercel。

---

## Technology Stack

| Area | Technology |
| --- | --- |
| Data Source | CWA Open Data |
| Data / ETL | PowerShell |
| Database | SQLite |
| Data Contract | Static JSON |
| Frontend Runtime | Node.js |
| Build Tool | Vite |
| Language | TypeScript |
| GIS | Leaflet |
| Basemap (v1.0.0) | CARTO Raster — Dark / Light |
| Map Labels (v1.0.0) | CARTO raster labels（主要為英文） |
| PowerShell Testing | Pester 6.2.0 |
| Frontend Testing | Vitest |
| CI | GitHub Actions |
| Deployment | Vercel |

---

## Prerequisites

建議本機開發環境：

| Requirement | Recommended Version / Note |
| --- | --- |
| Git | Current stable version |
| Windows | Windows 10 / 11 recommended |
| PowerShell | PowerShell 7+ recommended |
| Node.js | **20.x**（與目前 GitHub Actions CI 一致） |
| npm | 隨 Node.js 安裝 |
| Pester | **6.2.0** |
| CWA API Key | Full data pipeline 必要 |

> Gate 1 / Gate 2 目前的 SQLite helper 使用 Windows `winsqlite3.dll`，因此完整資料管線目前以 **Windows** 為主要 local development environment。  
> Gate 3 frontend 則可在任何支援 Node.js 的環境執行。

確認 Node.js 與 npm：

~~~bash
node --version
npm --version
~~~

確認 PowerShell：

~~~powershell
$PSVersionTable.PSVersion
~~~

---

## Quick Start

### Option A — Frontend Preview

如果 repository 中已經存在：

~~~text
web/public/weather.json
~~~

只想啟動目前 GIS 畫面，不需要重新呼叫 CWA API。

~~~bash
cd web
npm ci
npm run dev
~~~

Vite 會顯示 local development URL，例如：

~~~text
http://localhost:5173
~~~

這個模式需要：

~~~text
Node.js + npm
~~~

不需要 CWA API Key。

---

### Option B — Full Data Pipeline

若要從 CWA 重新取得最新資料並完整重建：

~~~text
CWA
 ↓
ETL
 ↓
SQLite
 ↓
weather.json
 ↓
Vite GIS
~~~

#### 1. Clone Repository

~~~bash
git clone https://github.com/wupojung/AIoT_L3_CWA_HW1.git
cd AIoT_L3_CWA_HW1
~~~

#### 2. Create Local Environment File

使用 PowerShell：

~~~powershell
Copy-Item .env.example .env
~~~

編輯：

~~~env
CWA_API_KEY=<YOUR_CWA_API_KEY>
~~~

`.env` 已由 `.gitignore` 排除，不得 commit。

#### 3. Run ETL

~~~powershell
./src/Run-Etl.ps1
~~~

成功後應產生：

~~~text
data/weather.db
~~~

#### 4. Export SQLite to JSON

~~~powershell
./src/Export-WeatherJson.ps1
~~~

成功後應產生 / 更新：

~~~text
web/public/weather.json
~~~

#### 5. Install Frontend Dependencies

~~~bash
cd web
npm ci
~~~

#### 6. Start GIS Web

~~~bash
npm run dev
~~~

---

## Available Commands

### PowerShell

Run ETL:

~~~powershell
./src/Run-Etl.ps1
~~~

Export frontend JSON:

~~~powershell
./src/Export-WeatherJson.ps1
~~~

Run all Pester tests:

~~~powershell
Invoke-Pester -Path ./tests -Output Detailed
~~~

CI-compatible Pester command:

~~~powershell
Invoke-Pester -Path ./tests -CI -Output Detailed
~~~

### Frontend

在 `web/`：

~~~bash
npm ci
npm run dev
npm run test -- --run
npm run build
npm run preview
~~~

TypeScript validation:

~~~bash
npx tsc --noEmit
~~~

Production build output：

~~~text
web/dist/
~~~

---

## Development Status

| Gate | Status | Evidence |
| --- | :---: | --- |
| Gate 1 — CWA API | ✅ PASS | [![Verification](https://img.shields.io/github/actions/workflow/status/wupojung/AIoT_L3_CWA_HW1/gate1-api.yml?branch=main&label=Verification)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate1-api.yml) |
| Gate 2 — ETL & SQLite | ✅ PASS | [![Verification](https://img.shields.io/github/actions/workflow/status/wupojung/AIoT_L3_CWA_HW1/gate2-integration.yml?branch=main&label=Verification)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate2-integration.yml) |
| Gate 3 — Taiwan GIS Web | ✅ PASS | [![Verification](https://img.shields.io/github/actions/workflow/status/wupojung/AIoT_L3_CWA_HW1/gate3-gis.yml?branch=main&label=Verification)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate3-gis.yml) |
| Gate 4 — GitHub & Continuous Integration | ✅ PASS | [![Verification](https://img.shields.io/github/actions/workflow/status/wupojung/AIoT_L3_CWA_HW1/gate4-quality.yml?branch=main&label=Verification)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate4-quality.yml) |
| Gate 5 — Vercel Deployment | ✅ PASS | [![Production](https://img.shields.io/badge/Production-Live-22c55e?logo=vercel&logoColor=white)](https://twsky.vercel.app/) |

> **Status** 表示目前 release 的 Gate decision；**Evidence** 連到對應的自動化驗證或 Production。新版本若修改既有功能，仍須依 Five-Gate re-entry policy 重新驗證受影響 Gate。

---

## Version Roadmap

| Version | Direction | Earliest Affected Gate | Status |
| --- | --- | --- | --- |
| **v1.0.0** | CARTO Dark / Light + current GIS baseline | Gate 1 | **Current Release** |
| **v1.1.0** | CARTO `dark_nolabels / light_nolabels` + 自製台灣繁中標籤 | Gate 3 | Planned |
| **v1.2.0** | MapTiler Dark / Dataviz Dark + Traditional Chinese labels | Gate 3 | Planned |

### v1.1.0 — Custom Traditional Chinese Labels

規劃保持：

```text
Vite + TypeScript + Leaflet + CARTO
```

將 CARTO raster 改成 no-label variant，再由本專案自行疊加台灣縣市 / 重要區域的繁體中文標籤。

目標是改善目前 CARTO raster labels 主要為英文、且無法由 Leaflet 直接切換語言的限制，同時維持現有 GIS architecture。

### v1.2.0 — MapTiler + Traditional Chinese

規劃重新評估 basemap provider：

```text
Leaflet
+
MapTiler Dark / Dataviz Dark
+
Traditional Chinese language
```

此版本會重新進入 Gate 3，重新驗證 map language、API key、attribution、fallback、tests、CI 與 production deployment。

詳細版本變更與技術背景請見：

- [CHANGELOG.md](CHANGELOG.md)
- [Technology Decisions](docs/technology-decisions.md)

---

## Five-Gate Development Workflow

~~~text
Gate 1 — CWA API
        ↓
Gate 2 — ETL & SQLite
        ↓
Gate 3 — Taiwan GIS Web
        ↓
Gate 4 — GitHub & Continuous Integration
        ↓
Gate 5 — Vercel Deployment
~~~

每個 Gate 固定遵守：

~~~text
BUILD
  ↓
RUN
  ↓
TEST
  ↓
VERIFY
  ↓
PASS
  ↓
NEXT GATE
~~~

若驗證失敗：

~~~text
FAIL
 ↓
FIX
 ↓
TEST AGAIN
~~~

詳細規範請見 [myplan/workflow.md](myplan/workflow.md)。

> Five-Gate Workflow 是每個 release 的品質驗證模型。後續版本可以回到最早受影響 Gate，重新驗證該 Gate 與所有 downstream Gates。

---

## CI Architecture

本專案將 **Overall CI** 與 **Gate Verification** 分開。

### Overall CI

`.github/workflows/ci.yml`

每次 Push / Pull Request 執行：

~~~text
Repository Baseline
        +
PowerShell Syntax / Pester
        +
SQLite / Export Tests
        +
TypeScript Validation
        +
Vitest
        +
Vite Production Build
        ↓
Overall CI PASS / FAIL
~~~

Overall CI 以 deterministic tests 為主，不在每次 push 呼叫真實 CWA API。

### Gate 1 — CWA API

`gate1-api.yml`

~~~text
Repository Secret
      ↓
Real CWA API
      ↓
Parser
      ↓
Required Fields
      ↓
PASS / FAIL
~~~

### Gate 2 — ETL & SQLite

`gate2-integration.yml`

~~~text
Real CWA API
      ↓
PowerShell ETL
      ↓
SQLite
      ↓
Row / Unique ID Verification
      ↓
PASS / FAIL
~~~

### Gate 3 — Taiwan GIS Web

`gate3-gis.yml`

~~~text
SQLite → JSON Contract
        +
Tracked weather.json
        ↓
TypeScript
        ↓
Vitest
        ↓
Vite Build
        ↓
PASS / FAIL
~~~

---

## Testing Strategy

### PowerShell / Data Layer

主要驗證：

- CWA Client / Parser
- HTTP error handling
- PowerShell syntax
- SQLite schema
- SQLite operations
- JSON export contract
- Missing database behavior

使用：

~~~text
Pester 6.2.0
~~~

### Frontend

主要驗證：

- Weather data parsing
- Application logic
- TypeScript correctness
- Vite production build

使用：

~~~text
Vitest
TypeScript
Vite
~~~

不測試 Leaflet library internals。

詳細測試規範請見 [docs/testing.md](docs/testing.md)。

---

## Project Structure

~~~text
AIoT_L3_CWA_HW1/
├── README.md
├── CHANGELOG.md
├── LICENSE
├── .env.example
├── .gitignore
│
├── myplan/
│   └── workflow.md
│
├── docs/
│   ├── architecture.md
│   ├── testing.md
│   └── technology-decisions.md
│
├── src/
│   ├── CwaClient.psm1
│   ├── SQLiteHelper.psm1
│   ├── Run-Etl.ps1
│   ├── Export-WeatherJson.ps1
│   └── schema.sql
│
├── tests/
│   ├── CwaClient.Tests.ps1
│   ├── SQLiteHelper.Tests.ps1
│   ├── Export-WeatherJson.Tests.ps1
│   ├── PowerShellSyntax.Tests.ps1
│   └── fixtures/
│
├── web/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── public/
│   │   └── weather.json
│   ├── src/
│   └── tests/
│
└── .github/
    └── workflows/
        ├── ci.yml
        ├── gate1-api.yml
        ├── gate2-integration.yml
        ├── gate3-gis.yml
        ├── gate4-quality.yml
        └── gate5-data-refresh.yml
~~~

---

## Environment Variables & Security

### Local Development

本機使用：

~~~env
CWA_API_KEY=<YOUR_CWA_API_KEY>
~~~

存放於：

~~~text
.env
~~~

真正的 API Key 不得出現在：

- Source Code
- README
- Markdown 文件
- Test Fixture
- Git history
- GitHub Actions logs

### GitHub Actions

Gate 1 / Gate 2 使用 GitHub Repository Secret：

~~~text
CWA_API_KEY
~~~

Workflow 透過：

~~~text
${{ secrets.CWA_API_KEY }}
~~~

注入環境變數。

日常 `ci.yml` 與 Gate 3 verification 不需要 CWA Secret。

---

## Deployment

目前 Production：

[https://twsky.vercel.app/](https://twsky.vercel.app/)

Production architecture：

~~~text
GitHub
  ↓
CI / Gate Verification
  ↓
Vercel
  ↓
Vite Static Site
  ↓
weather.json
~~~

Gate 3 使用 Vite 產生：

~~~text
web/dist/
~~~

Production verification 持續確認：

- Public URL reachable
- GIS loads correctly
- `weather.json` 可正常讀取
- 無 blocking runtime error
- Secret 未暴露
- Basemap attribution 正確
- 新版本的 map language / label behavior 符合 release requirement

---

## License

本專案自行撰寫的 **source code 與 project documentation** 採用 [MIT License](LICENSE)。

```text
Copyright (c) 2026 wupojung
SPDX-License-Identifier: MIT
```

MIT License 不會重新授權第三方內容。以下內容仍受各自的原始條款約束：

- 中央氣象署（CWA）Open Data。
- CARTO / OpenStreetMap basemap、tiles 與 attribution。
- npm / third-party libraries 與其各自的 open-source licenses。

使用或散布本專案時，請同時遵守相關第三方資料與服務條款。

---

## Documentation

- [Development Workflow](myplan/workflow.md)
- [Architecture](docs/architecture.md)
- [Testing Strategy](docs/testing.md)
- [Technology Decisions](docs/technology-decisions.md)
- [Release History / Changelog](CHANGELOG.md)
- [MIT License](LICENSE)

---

## Design Principles

- Keep it simple.
- Do not over-engineer.
- Production weather data must come from real CWA data.
- UI does not directly call the CWA API.
- Secrets never enter frontend source code.
- Automated tests are required evidence, not optional documentation.
- A green badge is automated evidence; manual verification is still required where the Gate contract specifies it.
