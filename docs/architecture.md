# Architecture

## 1. Architecture Goals

本專案架構追求：

- 足夠專業但不過度工程化。
- Business / transformation logic 可獨立測試。
- External API、data transformation、persistence、UI responsibility 分離。
- 技術選擇只在需求出現時做，不為了形式加入額外 layer。

## 2. System Context

~~~text
CWA Open Data
      ↓
Taiwan Weather GIS Web
      ↓
End User
~~~

外部依賴目前只有必要的 CWA Data Source、GIS/Web runtime 與 deployment platform。

## 3. Data Flow

目標資料流：

~~~text
CWA API
   ↓
API Client
   ↓
Parser
   ↓
Transformer / Domain Logic
   ↓
Repository
   ↓
SQLite
   ↓
Application Logic
   ↓
Taiwan GIS UI
   ↓
Vercel Deployment
~~~

實際 API Schema 必須先由 Gate 1 的真實 Response 驗證。

## 4. Core Components

### CWA API

- Responsibility：提供真實中央氣象署 Open Data。
- Input：HTTP request + authorization。
- Output：真實 API response。

### API Client

- Responsibility：HTTP request、status/error handling。
- Input：request parameters / environment configuration。
- Output：raw/decoded response。
- Must NOT：負責 SQLite write 或 UI logic。

### Parser

- Responsibility：依已觀察的 CWA Schema 解讀 response。
- Input：CWA response。
- Output：parsed data。
- Must NOT：猜測尚未驗證的欄位、直接操作 UI。

### Transformer / Domain Logic

- Responsibility：將 parsed external data 轉成應用程式需要的穩定 representation。
- Input：parsed CWA data。
- Output：domain / persistence-ready data。
- Design Goal：盡量保持 deterministic、可 Unit Test。

### Repository

- Responsibility：隔離 SQLite persistence/query details。
- Input：domain/persistence data 或 query。
- Output：stored/query results。
- Must NOT：包含 GIS presentation logic。

### SQLite

- Responsibility：Gate 2 的 local persistence。
- Schema：只根據真實資料需求建立。
- Testing：Repository tests 使用 temporary isolated SQLite。

### Application Logic

- Responsibility：協調 repository data、selection、filtering、formatting、location mapping。
- Design Goal：重要 business logic 與 UI component 解耦並可獨立測試。

### Taiwan GIS UI

- Responsibility：呈現台灣地圖、行政區互動與氣象資訊。
- Must NOT：直接重新實作 ETL 或 hard-code production weather。

## 5. Dependency Direction

建議依賴方向：

~~~text
GIS UI
  ↓
Application Logic
  ↓
Repository
  ↓
SQLite
~~~

External ingestion：

~~~text
CWA API → API Client → Parser → Transformer → Repository
~~~

避免 UI 直接依賴 CWA raw JSON。

## 6. Data Boundary

External CWA Schema 與 internal application representation 是不同 boundary。

~~~text
External CWA JSON
      ↓ Parser
Parsed External Data
      ↓ Transformer
Application / Domain Data
~~~

這個 boundary 讓 CWA 格式變更時，不必讓整個 UI 與資料庫同時依賴 raw schema。

## 7. External Dependencies

目前已確定：

- CWA Open Data
- SQLite
- GitHub / GitHub Actions
- Vercel（目標 deployment platform）

Gate 3 確定的 Frontend Stack：

| 項目 | 技術選擇 |
|---|---|
| Build Tool + Language | Vite 5 + TypeScript 5 |
| GIS Library | Leaflet 1.9 |
| Application Runtime | Node.js 20 |
| Frontend Testing | Vitest 1.x |
| Basemap Tile Service | CARTO Basemap CDN（需 `VITE_CARTO_API_KEY`）|
| Static Data Contract | `web/public/weather.json`（PowerShell ETL 產出）|

## 8. Deployment Architecture

目標：

~~~text
GitHub
  ↓ CI PASS
Vercel
  ↓
Taiwan Weather GIS Web
~~~

SQLite 在 Production 的使用方式必須於 Gate 5 前驗證。不得假設 local writable SQLite 等同於 Vercel persistent production database。

## 9. Architecture Decisions（Gate 5 已確定）

| 問題 | 決定 |
|---|---|
| Frontend framework | Vite 5 + TypeScript 5 |
| GIS library | Leaflet 1.9 |
| Web 如何讀取天氣資料 | Static JSON（`web/public/weather.json`），由 Vite publicDir 複製至 dist |
| Frontend 測試 | Vitest 1.x（WeatherService + WeatherClassifier，43 tests）|
| Production 資料如何定期更新 | GitHub Actions Cron Job (`gate5-data-refresh.yml`) 定期執行 PowerShell ETL 產生新的 `weather.json` 並推播，觸發 Vercel 自動部署。 |
| Gate 5 Persistence | Vercel 靜態託管 (`vercel.json`)，無須真實 production database。 |


## 10. Explicit Non-Goals

目前不主動加入：

- Microservices
- Kubernetes
- Complex DDD
- Event Sourcing
- Excessive ADR
- 不必要的 design patterns
- CRISP-DM