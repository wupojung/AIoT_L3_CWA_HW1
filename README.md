# Taiwan Weather GIS Web

以中央氣象署（CWA）Open Data 為資料來源的課程專案。專案目標是建立可測試、可持續整合、可部署的 Taiwan Weather GIS Web。

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
| Database | SQLite |
| GIS | TBD |
| Frontend | TBD |
| Testing | TBD by actual runtime/toolchain |
| CI | GitHub Actions |
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

詳細 Gate Contract 請見 [myplan/workflow.md](myplan/workflow.md)。

## Development Status

| Gate | Status |
| --- | --- |
| Gate 1 — CWA API | PENDING |
| Gate 2 — ETL & SQLite | PENDING |
| Gate 3 — Taiwan GIS Web | PENDING |
| Gate 4 — GitHub & Continuous Integration | PENDING |
| Gate 5 — Vercel Deployment | PENDING |

> README 的狀態只做摘要。真正的 PASS 來源必須是 Automated Tests、GitHub Actions 與必要的 Manual Verification。

## Testing Strategy

本專案重點測試 Parser、Transformer、ETL、Domain Logic 與 Repository。

- Unit Tests：純邏輯、Parser、Transformer、Domain Logic。
- Integration Tests：真實 CWA API、ETL pipeline、SQLite integration。
- Repository Tests：使用 isolated temporary SQLite。
- UI Verification：只測必要 application logic 與基本整合，不追求不必要的 UI coverage。
- Deployment Smoke Test：Gate 5 驗證 Production。

詳細策略請見 [docs/testing.md](docs/testing.md)。

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

tests/

.github/
└── workflows/
    └── ci.yml
~~~

Application source structure 尚未決定，避免在取得真實 API Schema 與選定實作工具前過早設計。

## Setup

目前尚未開始 Application implementation。實際安裝與執行指令會在技術棧確認後補上。

## Environment Variables

本機 Secret 使用 `.env`，但 `.env` 不得 Commit。

範例：

~~~env
CWA_API_KEY=<YOUR_CWA_API_KEY>
~~~

請由 `.env.example` 建立本機 `.env`。真正 API Key 不得寫入 Source Code、README、Markdown、Test Fixture 或 Git history。

## Running Tests

測試指令會在 Gate 1 選定實際 runtime / testing tool 後加入。所有可重複的 automated tests 必須能由 Gate 4 的 GitHub Actions 執行。

## Documentation

- [Development Workflow](myplan/workflow.md)
- [Architecture](docs/architecture.md)
- [Testing Strategy](docs/testing.md)

## Deployment

Gate 5 使用 Vercel。Deployment 前必須先完成 Gate 4 CI 驗證；Production PASS 需要 Public URL 與 Smoke Test 證據。