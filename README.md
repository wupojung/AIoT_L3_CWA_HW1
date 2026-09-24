# Taiwan Weather GIS Web

[![CI](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/ci.yml)
[![Gate 2 Integration](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate2-integration.yml/badge.svg?branch=main)](https://github.com/wupojung/AIoT_L3_CWA_HW1/actions/workflows/gate2-integration.yml)

以中央氣象署（CWA）Open Data 為資料來源的課程專案。專案目標是建立可測試、可持續整合、可部署的 Taiwan Weather GIS Web。

> 上方 CI Badge 由 GitHub Actions 自動更新，反映 `main` branch 的實際 workflow 狀態，不是人工填寫的 PASS。

## Project Overview

核心資料流程：

~~~text
CWA Open Data
    ↓
API Client
    ↓
Parser / Transformer
    ↓
SQLite
    ↓
Taiwan GIS Web
    ↓
GitHub Actions CI
    ↓
Vercel
~~~

## Project Goal

- 使用真實 CWA Open Data，不以假天氣資料取代正式整合。
- 取得並理解真實 API Response 後再設計 Parser 與資料模型。
- 建立 ETL + SQLite 資料層。
- 將台灣地區氣象資訊呈現在 GIS Web。
- 以 Automated Tests、Manual Verification 與 GitHub Actions 提供可重複的 PASS 證據。
- 完成 Vercel Deployment 與 Production Smoke Test。

## Architecture Overview

詳細架構請見 [docs/architecture.md](docs/architecture.md)。

## Technology Stack

| Area | Current Decision |
| --- | --- |
| Data Source | CWA Open Data |
| Data / ETL | PowerShell |
| Database | SQLite |
| GIS | TBD |
| Frontend | TBD |
| Testing | Pester 6.2.0 |
| CI | GitHub Actions |
| CI Test Runner | Windows / PowerShell (`pwsh`) |
| Deployment | Vercel |

尚未確認的技術不提前假設；實作時依 Gate 需求與驗證結果決定。

## Five-Gate Workflow

~~~text
Gate 1 — CWA API
Gate 2 — ETL & SQLite
Gate 3 — Taiwan GIS Web
Gate 4 — GitHub & Continuous Integration
Gate 5 — Vercel Deployment
~~~

每一 Gate 都遵守：

~~~text
BUILD → RUN → TEST → VERIFY → PASS → NEXT GATE
~~~

Testing 與 Continuous Integration 都是跨 Gate 品質機制。CI 不等待 Gate 4 才開始；只要產生可重複執行的 Automated Tests，就應納入 GitHub Actions。

Gate 4 的角色是 **CI Hardening / Final Repository Verification**，而不是第一次建立 CI。

詳細 Gate Contract 請見 [myplan/workflow.md](myplan/workflow.md)。

## Development Status

| Gate | Status |
| --- | --- |
| Gate 1 — CWA API | PASS |
| Gate 2 — ETL & SQLite | PASS |
| Gate 3 — Taiwan GIS Web | PENDING |
| Gate 4 — GitHub & Continuous Integration | PENDING |
| Gate 5 — Vercel Deployment | PENDING |

> README 的 Gate Status 是 Project Progress Summary。真正的 Automated Verification Status 由 GitHub Actions CI Badge、workflow run 與必要的 Manual Verification 提供。

### Gate 2 Verification Evidence

Gate 2 已完成真實整合驗證：

~~~text
GitHub Repository Secret
        ↓
Real CWA API
        ↓
PowerShell Parser / ETL
        ↓
SQLite weather.db
        ↓
Database Query Verification
        ↓
PASS
~~~

最近一次 Gate 2 Integration 驗證結果：

- Repository Secret `CWA_API_KEY`：可由 GitHub Actions 正常注入。
- Real CWA API → ETL：PASS。
- Parsed stations：363。
- SQLite `weather_observations` rows：363。
- Unique `StationId` rows：363。
- Missing `StationId`：0。
- Gate 2 Integration Workflow：PASS。

Gate 2 Integration 採獨立 workflow，平常以手動觸發為主，避免每次 Push 都呼叫真實 CWA API。README 上方的 **Gate 2 Integration** Badge 會反映該 workflow 的最近驗證狀態。

## Testing Strategy

目前 PowerShell Automated Tests 使用 **Pester 6.2.0**。

主要測試：

- CWA Client / Parser
- SQLite layer
- ETL / Transformer
- 後續 Application Logic

測試程式放在：

~~~text
tests/
~~~

GitHub Actions 不另外實作一套 Tests，而是執行與 Local Development 相同的 Test Suite。

### Local

~~~powershell
Invoke-Pester -Path ./tests -Output Detailed
~~~

### Continuous Integration

~~~powershell
Invoke-Pester -Path ./tests -CI -Output Detailed
~~~

流程：

~~~text
Code
 ↓
Local Pester
 ↓
Commit / Push
 ↓
GitHub Actions
 ↓
Pester
 ↓
PASS / FAIL
~~~

詳細測試規範請見 [docs/testing.md](docs/testing.md)。

## Project Structure

~~~text
README.md
.gitignore
.env.example

myplan/
└── workflow.md

docs/
├── architecture.md
└── testing.md

src/
├── CwaClient.psm1
├── SQLiteHelper.psm1
├── Run-Etl.ps1
└── schema.sql

tests/
├── CwaClient.Tests.ps1
├── SQLiteHelper.Tests.ps1
└── fixtures/

.github/
└── workflows/
    └── ci.yml
~~~

## Setup

目前 Application implementation 仍依 Gate 漸進建立。請使用 PowerShell 開發環境，並於本機安裝專案指定版本 Pester。

~~~powershell
Install-Module Pester -RequiredVersion 6.2.0 -Scope CurrentUser -Force
Import-Module Pester -RequiredVersion 6.2.0 -Force
~~~

## Environment Variables

本機 Secret 使用 `.env`，但 `.env` **不得 Commit 到 GitHub**。

範例：

~~~env
CWA_API_KEY=<YOUR_CWA_API_KEY>
~~~

請由 `.env.example` 建立本機 `.env`。

真正 API Key 不得寫入：

- Source Code
- README
- Markdown 文件
- Test Fixture
- Git history

GitHub Actions 若未來需要執行真實 CWA Integration Test，應使用 **GitHub Actions Secrets**，例如：

~~~text
CWA_API_KEY
~~~

並由 workflow 以 `${{ secrets.CWA_API_KEY }}` 注入環境變數，而不是上傳 `.env`。

目前日常 CI 以 deterministic fixtures / mocks 為主，不需要 CWA Secret 即可執行。

## Running Tests

~~~powershell
Invoke-Pester -Path ./tests -Output Detailed
~~~

新的或修改過的 Tests 採用 Pester 6 推薦的 `Should-*` assertions，例如：

~~~powershell
$result.Count | Should-Be 1
{ Invoke-Something } | Should-Throw
~~~

## Documentation

- [Development Workflow](myplan/workflow.md)
- [Architecture](docs/architecture.md)
- [Testing Strategy](docs/testing.md)

## Deployment

Gate 5 使用 Vercel。Deployment 前必須先完成 Gate 4 CI 驗證；Production PASS 需要 Public URL 與 Smoke Test 證據。
