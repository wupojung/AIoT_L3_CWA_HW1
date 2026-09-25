# Architecture

## 1. Architecture Goals

本專案架構追求：

- 足夠專業但不過度工程化。
- Business / transformation logic 可獨立測試。
- External API、data transformation、persistence、UI responsibility 分離。
- Production deployment 保持簡單、可重現。
- 技術決策可隨版本演進，但每次變更都必須重新通過受影響 Gate。

目前 baseline release：

```text
v1.0.0
```

版本歷史請見 [CHANGELOG.md](../CHANGELOG.md)，完整技術決策請見 [technology-decisions.md](technology-decisions.md)。

---

## 2. System Context

```text
CWA Open Data
      ↓
PowerShell Data Pipeline
      ↓
Static Weather Dataset
      ↓
Taiwan Weather GIS Web
      ↓
End User
```

目前 production URL：

https://twsky.vercel.app/

---

## 3. Current Data Flow — v1.0.0

```text
CWA API (O-A0003-001)
   ↓
API Client / Parser
   ↓
PowerShell ETL
   ↓
SQLite
   ↓
Export-WeatherJson.ps1
   ↓
web/public/weather.json
   ↓
Vite + TypeScript
   ↓
Leaflet
   ↓
CARTO Raster Basemap
   ↓
Vercel Static Deployment
```

`O-A0003-001` 是 **Current Weather Observation（目前天氣觀測）**，不是 forecast dataset。

---

## 4. Core Components

### CWA API

- 提供中央氣象署真實 Open Data。
- CWA API Key 只存在 local environment / GitHub Actions secret。
- Browser 不直接呼叫 CWA API。

### API Client / Parser

- 處理 HTTP request、status/error handling。
- 依已觀察的真實 CWA schema 解析 response。
- 必須保持可被 Pester unit test mock。

### PowerShell ETL

- 將 parsed observation data 寫入 SQLite。
- 處理 null、missing、duplicate 與 refresh。
- 支援可重複執行。

### SQLite

- Gate 2 persistence layer。
- 不作為 production browser database。
- Tests 使用 isolated temporary SQLite。
- 目前 helper 使用 Windows `winsqlite3.dll`，因此完整 local data pipeline 以 Windows 為主要環境。

### Static JSON Data Contract

```text
SQLite
  ↓
Export-WeatherJson.ps1
  ↓
web/public/weather.json
```

這是 Gate 2 → Gate 3 的穩定資料邊界。

JSON 必須使用 UTF-8 without BOM，避免 Node / browser parser compatibility 問題。

### Frontend

目前 stack：

| Area | Technology |
|---|---|
| Runtime / Toolchain | Node.js 20 |
| Build Tool | Vite 5 |
| Language | TypeScript 5 |
| GIS | Leaflet 1.9 |
| Frontend Testing | Vitest 1.x |

### Taiwan GIS UI

目前包含：

- Taiwan map
- Temperature layer
- Humidity layer
- Weather condition layer
- Layer control
- Dynamic legend
- Weather popup
- Responsive UI
- CARTO dark / light basemap

---

## 5. Dependency Direction

Production browser dependency：

```text
GIS UI
  ↓
Application Logic
  ↓
Static weather.json
```

Data ingestion：

```text
CWA API
  ↓
API Client / Parser
  ↓
ETL
  ↓
SQLite
  ↓
JSON Export
```

Browser 不依賴 raw CWA JSON，也不直接依賴 SQLite。

---

## 6. Security Boundaries

### CWA API Key

```text
CWA_API_KEY
= secret
= 不可進 browser
= 不可 commit
```

### CARTO Basemap Key

```text
VITE_CARTO_API_KEY
= client-side key
= browser 可見
= 不等同於 CWA secret
```

Basemap client key 的風險控制應依 provider 支援使用 domain / referrer restriction。

### Attribution

Basemap provider / OpenStreetMap attribution 必須持續顯示，不因 UI 美化而移除。

---

## 7. Basemap & Localization Evolution

### v1.0.0 — CARTO Raster

目前使用：

```text
dark_all
light_all
```

優點：

- Leaflet integration 簡單。
- Dark Matter 適合 weather data overlay。
- 不需要額外 GIS SDK。

已知限制：

- Raster labels 已畫進 PNG tile。
- 目前 labels 主要呈現英文。
- Leaflet client 無法直接將既有 raster labels 切換成 `zh-TW`。

### v1.1.0 — Planned: CARTO no-label + 自製繁中標籤

預計改為：

```text
CARTO dark_nolabels / light_nolabels
        +
Custom Taiwan Traditional Chinese Labels
```

目標：

- 保留 Leaflet / CARTO 架構。
- 自行控制台灣縣市與重要區域中文標籤。
- 不追求完整道路 / POI 中文化。
- 降低 map label 對 weather visualization 的視覺干擾。

最早受影響 Gate：

```text
Gate 3
```

因此 release verification：

```text
Gate 3 → Gate 4 → Gate 5
```

### v1.2.0 — Planned: MapTiler Dark + Traditional Chinese

預計評估：

```text
Leaflet
  +
MapTiler Dark / Dataviz Dark
  +
Traditional Chinese language
```

MapTiler Leaflet integration 支援 map language，SDK 提供 `Language.TRADITIONAL_CHINESE`。

預期優點：

- 原生多語系 labels。
- Dark data-visualization basemap。
- 降低自製 labels 的維護成本。

預期代價：

- 新 provider dependency。
- 新 client-side API key。
- 新 environment configuration。
- attribution / fallback / deployment 需重新驗證。

此版本同樣從 Gate 3 重新驗證。

官方參考：

- CARTO Basemaps: https://www.carto.com/basemaps/
- MapTiler Leaflet language: https://docs.maptiler.com/leaflet/examples/map-language/
- MapTiler Language API: https://docs.maptiler.com/sdk-js/api-reference/variables/Language/

---

## 8. CI / Verification Architecture

```text
ci.yml
= repository health

gate1-api.yml
= real CWA API verification

gate2-integration.yml
= CWA → ETL → SQLite verification

gate3-gis.yml
= JSON contract + frontend GIS verification

gate4-quality.yml
= repository reproducibility / quality verification
```

Gate 5 production 目前由 Vercel deployment 與 scheduled data refresh workflow 支援。

CI 與 Gate verification 分離，避免每次 push 都依賴 real CWA API。

---

## 9. Deployment Architecture

v1.0.0 production：

```text
GitHub
  ↓
CI / Gate Verification
  ↓
Vercel
  ↓
Static Vite Site
  ↓
weather.json
```

Production 不需要 writable SQLite database。

Weather data refresh 由 GitHub Actions 定期重新執行 ETL / JSON export，再觸發新的 static deployment。

---

## 10. Versioned Architecture Policy

Five-Gate PASS 不是永久鎖定。

每個新版本先找出最早受影響 Gate：

```text
Version Change
     ↓
Earliest Affected Gate
     ↓
TEST / VERIFY
     ↓
All Downstream Gates
     ↓
Release
```

例如：

| Version Change | Earliest Gate | Revalidation |
|---|---|---|
| v1.1 自製繁中 labels | Gate 3 | Gate 3 → 4 → 5 |
| v1.2 MapTiler + zh-Hant | Gate 3 | Gate 3 → 4 → 5 |
| 未來改 forecast dataset | Gate 1 | Gate 1 → 2 → 3 → 4 → 5 |

---

## 11. Explicit Non-Goals

目前不主動加入：

- Microservices
- Kubernetes
- Complex DDD
- Event Sourcing
- Excessive ADR
- 不必要的 design patterns
- CRISP-DM

技術與架構演進以實際需求為準，不為了『看起來更大型』而增加複雜度。