# Taiwan Weather GIS Web

[![CI](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml)

以中央氣象署（CWA）Open Data 為資料來源的 Taiwan Weather GIS Web。  
專案採用 **PowerShell + SQLite** 建立資料管線，並以 **Vite + TypeScript + Leaflet** 建立前端 GIS，搭配 **Pester、Vitest 與 GitHub Actions** 提供可重複驗證的開發流程。

> 上方 **CI Badge** 代表目前整個 repository 的日常健康狀態；各 Gate 的驗證狀態請見 [Development Status](#development-status)。

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

| Gate | Status |
| --- | --- |
| Gate 1 — CWA API | [![Gate 1 API](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate1-api.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate1-api.yml) |
| Gate 2 — ETL & SQLite | [![Gate 2 Integration](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate2-integration.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate2-integration.yml) |
| Gate 3 — Taiwan GIS Web | [![Gate 3 GIS](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate3-gis.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate3-gis.yml) |
| Gate 4 — GitHub & Continuous Integration | [![Gate 4 Quality](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate4-quality.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate4-quality.yml) |
| Gate 5 — Vercel Deployment | [✅ Deployed (twsky.vercel.app)](https://twsky.vercel.app/) |

> Gate Badge 代表該 Gate 的 **Automated Verification** 狀態；正式 Gate PASS 仍須符合 `myplan/workflow.md` 中要求的 Manual Verification。

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
├── .env.example
├── .gitignore
│
├── myplan/
│   └── workflow.md
│
├── docs/
│   ├── architecture.md
│   └── testing.md
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
        └── gate3-gis.yml
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

最終目標平台：

~~~text
Vercel
~~~

Gate 3 使用 Vite 產生：

~~~text
web/dist/
~~~

Gate 5 將以 production deployment + smoke test 驗證：

- Public URL reachable
- GIS loads correctly
- `weather.json` 可正常讀取
- 無 blocking runtime error
- Secret 未暴露

---

## Documentation

- [Development Workflow](myplan/workflow.md)
- [Architecture](docs/architecture.md)
- [Testing Strategy](docs/testing.md)

---

## Design Principles

- Keep it simple.
- Do not over-engineer.
- Production weather data must come from real CWA data.
- UI does not directly call the CWA API.
- Secrets never enter frontend source code.
- Automated tests are required evidence, not optional documentation.
- A green badge is automated evidence; manual verification is still required where the Gate contract specifies it.
