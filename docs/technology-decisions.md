# Technology Decisions

本文件記錄 AIoT L3 CWA HW1 從初始規劃到目前版本的主要技術決策、遇到的問題、取捨與後續演進方向。

目的不是建立沉重的 ADR 流程，而是保留足夠的工程脈絡，讓後續版本知道：

- 為什麼當初這樣選。
- 哪些方案曾經考慮過。
- 哪些問題已經發生過。
- 哪些限制是已知且刻意接受的。
- 未來版本若改變決策，應從哪個 Gate 重新驗證。

---

## TD-001 — 採用 Five-Gate Workflow，不使用 CRISP-DM

**Status:** Accepted  
**Version:** v1.0.0

### Decision

專案使用：

```text
Gate 1 — CWA API
Gate 2 — ETL & SQLite
Gate 3 — Taiwan GIS Web
Gate 4 — GitHub & Continuous Integration
Gate 5 — Vercel Deployment
```

每個 Gate 遵守：

```text
BUILD → RUN → TEST → VERIFY → PASS → NEXT GATE
```

### Reason

本作業本質是小型軟體 / 資料整合 / GIS 專案，Five-Gate 足以管理風險，不需要引入 CRISP-DM 或更多流程層級。

### Consequence

- Testing 與 CI 是跨 Gate 品質機制，不建立 Gate 6。
- 後續版本可回到受影響的 Gate 重新驗證。

---

## TD-002 — CWA Dataset 使用 O-A0003-001

**Status:** Accepted  
**Version:** v1.0.0

### Finding

目前實際使用的 CWA dataset：

```text
O-A0003-001
```

此資料是 **Current Weather Observation（目前天氣觀測）**，不是 forecast。

### Consequence

UI、README、文件應使用：

```text
Current Weather Observation
目前天氣觀測
```

而不是「天氣預報」。

若未來要加入 forecast，必須重新選 dataset，並至少重新進入 Gate 1。

---

## TD-003 — Data / ETL 使用 PowerShell

**Status:** Accepted  
**Version:** v1.0.0

### Decision

Gate 1–2 使用 PowerShell 處理：

- CWA API request
- parsing
- ETL
- SQLite write
- JSON export

### Reason

- 與既有課程 / Windows 開發環境相容。
- 不需要為簡單資料管線增加 Python runtime。
- 可用 Pester 做 deterministic tests。

### Known Limitation

`SQLiteHelper.psm1` 使用 Windows `winsqlite3.dll`，完整資料管線目前以 Windows 為主要 local environment。

此限制不影響 Vercel production，因 production 不直接執行 SQLite runtime。

---

## TD-004 — Persistence 使用 SQLite

**Status:** Accepted  
**Version:** v1.0.0

### Decision

Gate 2 使用 SQLite 作為 ETL persistence。

### Reason

- 單機作業足夠。
- 無需 database server。
- 容易重建與驗證。
- 適合 temporary database integration tests。

### Consequence

SQLite 是 **data engineering layer**，不是 browser runtime database。

---

## TD-005 — Frontend 不直接讀 SQLite

**Status:** Accepted  
**Version:** v1.0.0

### Decision

資料邊界：

```text
CWA
 ↓
PowerShell ETL
 ↓
SQLite
 ↓
Export-WeatherJson.ps1
 ↓
web/public/weather.json
 ↓
Browser
```

### Rejected Alternatives

```text
Browser → CWA API
```

拒絕原因：

- CWA_API_KEY 會暴露於 browser。
- 增加 runtime external dependency。

```text
Browser → weather.db
```

拒絕原因：

- 不必要的 SQLite/browser complexity。
- 不符合 Vercel static deployment 方向。

### Consequence

Static JSON 成為 Gate 2 → Gate 3 的 stable data contract。

---

## TD-006 — Frontend 使用 Vite + TypeScript + Leaflet

**Status:** Accepted  
**Version:** v1.0.0

### Decision

Frontend stack：

| Area | Choice |
|---|---|
| Runtime / Toolchain | Node.js 20 |
| Build Tool | Vite |
| Language | TypeScript |
| GIS | Leaflet |
| Testing | Vitest |

### Alternatives Considered

- Python / Flask
- FastAPI
- React
- Next.js
- SSR

### Reason

Gate 3 需求主要是：

- Taiwan map
- weather markers
- layer switching
- popup
- loading / empty / error state

不需要大型 framework 或 server-side rendering。

### Consequence

Production 可以輸出靜態 `dist/` 並部署到 Vercel。

---

## TD-007 — Node.js 是必要的 frontend development dependency

**Status:** Accepted  
**Version:** v1.0.0

### Finding

即使 production 是 static site，開發、測試與 build 仍需要 Node.js。

目前 CI 使用：

```text
Node.js 20
```

### Consequence

README 必須明確列出 Node.js / npm prerequisites。

---

## TD-008 — Frontend dependencies 使用 npm ci

**Status:** Accepted  
**Version:** v1.0.0

### Finding

CI 早期使用 `npm install`。

後續改為：

```bash
npm ci
```

### Reason

Repository 已有 `package-lock.json`，CI 應使用 lock file 建立 deterministic clean install。

### Consequence

Local / CI reproducibility 提升。

---

## TD-009 — PowerShell testing 使用 Pester 6.2.0

**Status:** Accepted  
**Version:** v1.0.0

### Decision

Local 與 CI pin：

```text
Pester 6.2.0
```

新 / 修改 assertions 使用 Pester 6 `Should-*` syntax。

### Important Finding

Pester 6 沒有 `Should-NotThrow`。

「不應丟出 exception」的測試直接在 `It` block 執行 code；unexpected exception 會自然使 test fail。

---

## TD-010 — Real CWA Integration 與 deterministic CI 分離

**Status:** Accepted  
**Version:** v1.0.0

### Decision

`ci.yml` 不在每次 push 呼叫真實 CWA API。

日常 CI：

- fixtures
- mocks
- temporary SQLite
- TypeScript
- Vitest
- Vite build

Real CWA 驗證由 Gate workflow 執行。

### Reason

避免：

- network outage
- rate limit
- external service availability
- secret dependency

造成日常 CI 不穩定。

---

## TD-011 — Overall CI 與 Gate workflows 分離

**Status:** Accepted  
**Version:** v1.0.0

### Decision

```text
ci.yml
= repository health

gate1-api.yml
= real CWA API verification

gate2-integration.yml
= CWA → ETL → SQLite verification

gate3-gis.yml
= JSON contract + frontend verification

gate4-quality.yml
= final repository quality / reproducibility
```

### Reason

Badge 可以直接對應每個 Gate 的 automated evidence，同時保留一個 Overall CI 表示 repository 整體健康狀態。

---

## TD-012 — Test 不得依賴本機 weather.db

**Status:** Accepted  
**Version:** v1.0.0

### Problem Found

Gate 3 初期 `Export-WeatherJson.Tests.ps1` 直接期待：

```text
data/weather.db
```

但該 DB 是 generated local artifact，clean CI checkout 不存在。

### Resolution

測試改成：

```text
Temporary SQLite
  ↓
Seed deterministic data
  ↓
Run Export
  ↓
Verify JSON
  ↓
Cleanup
```

### Consequence

Clean CI 可重現。

---

## TD-013 — CWA HTTP client 必須可被 Unit Test mock

**Status:** Accepted  
**Version:** v1.0.0

### Problem Found

CWA client 一度從 `Invoke-RestMethod` 改成 `WebClient.DownloadString()`，但測試仍 mock `Invoke-RestMethod`。

結果：

- Mock 沒有攔截。
- Unit test 實際打到 CWA。
- CI 收到 401。

### Resolution

HTTP boundary 恢復成可被 Pester mock 的 `Invoke-RestMethod`。

### Principle

Unit tests 不應因 mock mismatch 意外呼叫 real external service。

---

## TD-014 — weather.json 使用 UTF-8 without BOM

**Status:** Accepted  
**Version:** v1.0.0

### Problem Found

第一次 Gate 3 workflow 讀取 tracked `weather.json` 時，Node `JSON.parse()` 因 UTF-8 BOM 失敗。

### Resolution

`Export-WeatherJson.ps1` 明確輸出：

```text
UTF-8 without BOM
```

既有 tracked `weather.json` 也進行 normalization。

### Consequence

PowerShell → JSON → Node / Browser 的跨工具資料契約更穩定。

---

## TD-015 — v1.0 Basemap 使用 CARTO Raster

**Status:** Accepted for v1.0.0

### Decision

目前 Leaflet basemap 使用 CARTO raster：

```text
dark_all
light_all
```

### Reason

- Leaflet integration 簡單。
- Dark Matter 適合 weather data overlay。
- 不需要重構 GIS library。

### Security Finding

`VITE_CARTO_API_KEY` 是 client-side basemap key。

它和 `CWA_API_KEY` 不同：

```text
CWA_API_KEY
= secret
= 不可進 browser

VITE_CARTO_API_KEY
= browser-visible client key
= 需要 provider domain/referrer restriction
```

### Attribution

必須保留：

```text
© OpenStreetMap contributors, © CARTO
```

### Official Reference

- CARTO Basemaps: https://www.carto.com/basemaps/
- CARTO Basemap Key: https://www.carto.com/basemaps/apikey/

---

## TD-016 — CARTO Raster label language limitation

**Status:** Known Limitation in v1.0.0

### Finding

目前 CARTO raster tile 的 labels 已畫進 PNG tile。

因此 Leaflet client 無法直接：

```text
lang=zh-TW
```

把 `dark_all / light_all` 的英文 labels 切成繁體中文。

### Available CARTO Variant

CARTO 官方提供：

```text
dark_nolabels
light_nolabels
```

這讓 application 可以保留底圖，但自行疊加 labels。

Official reference:

https://www.carto.com/basemaps/

---

## TD-017 — v1.1 採 CARTO no-label + 自製繁中標籤

**Status:** Planned  
**Target:** v1.1.0

### Decision

v1.1 預計：

```text
CARTO dark_nolabels / light_nolabels
        +
Taiwan custom Traditional Chinese label overlay
```

### Why

- 不更換 Leaflet。
- 不新增 map SDK。
- 修改範圍小。
- 可精準控制台灣縣市 / 重要區域中文標籤。
- 適合 Weather GIS data visualization。

### Tradeoff

自製 overlay 不會提供完整道路 / POI / 山川中文地名。

第一版只需要標示真正有資訊價值的台灣 labels。

### Gate Impact

最早受影響：

```text
Gate 3
```

因此 release 驗證：

```text
Gate 3 → Gate 4 → Gate 5
```

---

## TD-018 — v1.2 評估 MapTiler Dark + Traditional Chinese

**Status:** Planned  
**Target:** v1.2.0

### Decision

v1.2 預計評估：

```text
MapTiler Dark / Dataviz Dark
+
Leaflet integration
+
Traditional Chinese language
```

MapTiler 官方 Leaflet integration 支援設定 map language，SDK 也提供：

```text
Language.TRADITIONAL_CHINESE
```

### Why

目標是取得：

- dark data-visualization basemap
- 原生多語系 label
- Traditional Chinese map labels
- 較少自製 label maintenance

### Expected Cost

相較 v1.1：

- 新 provider dependency
- 新 client-side API key
- 新 environment configuration
- basemap implementation change
- attribution / fallback / deployment re-verification

因此此版本明確允許退回 Gate 3。

### Official References

- Leaflet multilingual example: https://docs.maptiler.com/leaflet/examples/map-language/
- MapTiler Language API: https://docs.maptiler.com/sdk-js/api-reference/variables/Language/
- Map language design: https://docs.maptiler.com/guides/map-design/change-language-in-a-map/

---

## TD-019 — Versioned Gate Re-entry

**Status:** Accepted  
**Introduced:** v1.0.0 documentation baseline

### Decision

Five-Gate Workflow 不代表 Gate PASS 後永遠不能回頭。

每個新 release 找出「最早受影響 Gate」：

```text
Change
  ↓
Earliest Affected Gate
  ↓
Rebuild / Test / Verify
  ↓
All Downstream Gates
  ↓
New Release
```

### Examples

v1.1 自製中文 label：

```text
Gate 3 → Gate 4 → Gate 5
```

v1.2 MapTiler：

```text
Gate 3 → Gate 4 → Gate 5
```

未來若更換 CWA forecast dataset：

```text
Gate 1 → Gate 2 → Gate 3 → Gate 4 → Gate 5
```

---

## Current Decision Summary

### v1.0.0

```text
CWA O-A0003-001
PowerShell
SQLite
Static JSON
Node.js 20
Vite
TypeScript
Leaflet
CARTO Raster
Pester 6.2.0
Vitest
GitHub Actions
Vercel
```

### v1.1.0 Planned

```text
Leaflet
+
CARTO no-label raster
+
Custom Taiwan Traditional Chinese labels
```

### v1.2.0 Planned

```text
Leaflet
+
MapTiler dark style
+
Traditional Chinese labels
```

---

## Documentation Rule

未來如果技術決策改變：

1. 更新本文件。
2. 更新 `CHANGELOG.md`。
3. 更新 `docs/architecture.md`。
4. 如影響 setup / runtime，更新 `README.md`。
5. 從最早受影響 Gate 重新驗證。


---

## TD-020 — 專案原始碼採 MIT License

**Status:** Accepted  
**Introduced:** v1.0.0 documentation baseline

### Decision

本專案自行撰寫的 source code 與 project documentation 採用：

```text
MIT License
SPDX-License-Identifier: MIT
```

Copyright holder 目前以 repository owner 表示：

```text
Copyright (c) 2026 wupojung
```

### Reason

MIT 是簡潔、寬鬆且廣泛使用的 open-source license，允許使用、修改、散布與再授權，並要求保留 copyright / permission notice。

### Scope Boundary

MIT 只涵蓋本專案有權授權的原始碼與文件，不重新授權：

- CWA Open Data。
- CARTO / OpenStreetMap map tiles、data 或 attribution。
- npm / third-party packages。

第三方資料與服務仍依其原始 license / terms 使用。

---

## TD-021 — Documentation Changes 採 Batch Commit / Push

**Status:** Accepted  
**Introduced:** v1.0.0 documentation baseline

### Problem

GitHub Actions 目前會在 push 時執行 CI / quality checks。

若 ChatGPT / IDE Agent 在修改 README、Architecture、Changelog 等文件時，每修改一小段就立即 push，會造成：

```text
small doc edit
    ↓
push
    ↓
CI run
    ↓
another small edit
    ↓
push
    ↓
another CI run
```

這會增加不必要的 Actions 執行次數、等待時間與運算資源消耗。

### Decision

Documentation-only 工作預設採：

```text
Collect Changes
    ↓
Review as One Batch
    ↓
Single Consolidated Commit
    ↓
Single Push
    ↓
CI Verification
```

不要為每個 wording、badge、table alignment 或小型 formatting change 個別 push。

### Exceptions

可以立即獨立提交：

- security / secret fix
- 使用者明確要求立即 verification
- 需要獨立保留 evidence 的重要變更
- 程式碼與文件必須分開驗證的情況

### Principle

減少 CI churn 不代表跳過 CI；而是 **一次完整變更對應一次有意義的 verification run**。


---

## TD-022 — README 採 English-first + Traditional Chinese Companion

**Status:** Accepted  
**Introduced:** v1.0.0 documentation baseline

### Decision

GitHub default landing page uses:

```text
README.md
= English

README.zh-TW.md
= Traditional Chinese
```

Both files provide direct language navigation.

### Reason

- English is the most interoperable default for public GitHub repositories.
- Traditional Chinese remains first-class documentation for local students and future course use.
- Root-level language variants are easier to discover than introducing a documentation framework or i18n build system.

### Documentation Structure

```text
README.md
README.zh-TW.md

docs/
├── getting-started.md
└── getting-started.zh-TW.md
```

README stays concise. Detailed setup and execution instructions belong in Getting Started.

---

## TD-023 — Environment Files Follow Runtime Scope

**Status:** Accepted  
**Introduced:** v1.0.0 documentation cleanup

### Problem

The previous root `.env.example` contained both:

```text
CWA_API_KEY
VITE_CARTO_API_KEY
```

However, Vite is executed from `web/` and does not read the repository-root `.env` by default.

### Decision

Separate configuration by runtime:

```text
/.env
└── CWA_API_KEY

/web/.env
└── VITE_CARTO_API_KEY
```

Templates:

```text
/.env.example
/web/.env.example
```

### Consequence

The documented local setup now matches how PowerShell and Vite actually resolve environment variables.


---

## TD-024 — v1.1 Preserves the Full O-A0003 Observation Contract

**Status:** Planned  
**Target:** v1.1.0

### Finding

v1.0.0 currently persists only station identity, location, weather, temperature, and humidity. The verified O-A0003-001 station schema also provides altitude, administrative codes, visibility, sunshine duration, precipitation, wind, pressure, UV, maximum 10-minute wind, gust information, and daily temperature extremes.

### Decision

v1.1.0 will preserve all application-relevant fields present in the verified current O-A0003-001 station response contract instead of discarding them during parsing.

"All fields" means the verified schema, not blindly persisting unknown future JSON properties.

### Gate Impact

The parser contract changes first:

```text
Gate 1 → Gate 2 → Gate 3 → Gate 4 → Gate 5
```

---

## TD-025 — v1.1 Uses a Bilingual Product UI

**Status:** Planned  
**Target:** v1.1.0

### Decision

The GIS UI supports:

```text
English
Traditional Chinese (zh-TW)
```

Use a small typed TypeScript translation dictionary rather than adding a large i18n framework.

Localization covers titles, layer names, legends, station detail labels, states, date/time formatting, and the language selector. Raw observation values remain separate from localized presentation.

### README Parity Rule

Whenever either root README changes, the same documentation batch must review both:

```text
README.md
README.zh-TW.md
```

They do not need word-for-word translation, but current release, roadmap, Quick Start, Gate status, Live Demo, License, and documentation links must remain equivalent.

---

## TD-026 — Complete Storage, Selective Visualization

**Status:** Planned  
**Target:** v1.1.0

### Decision

Complete data storage and map density are separate concerns.

Primary spatial layers:

```text
Temperature
Humidity
Precipitation
Wind
Pressure
UV Index
Weather
```

Detailed/contextual fields such as visibility, sunshine, altitude, codes, gust details, max 10-minute wind, daily extremes, and occurrence times belong in Station Detail.

This preserves data completeness without turning the map into an unreadable dashboard.
