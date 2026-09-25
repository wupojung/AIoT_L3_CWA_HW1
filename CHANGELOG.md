# Changelog

本專案使用版本化方式記錄功能、架構與部署演進。版本號採用 Semantic Versioning 的概念：

```text
MAJOR.MINOR.PATCH
```

- **MAJOR**：重大架構或不相容變更。
- **MINOR**：向後相容的新功能或明顯功能增強。
- **PATCH**：Bug fix、文件修正或不影響主要功能的調整。

> Five-Gate Workflow 是每個 release 的品質驗證模型。新版本若修改既有功能，可以回到最早受影響的 Gate，重新執行該 Gate 與後續 Gate。

---

## [Unreleased]

目前規劃中的後續版本。

### Documentation / Governance

- Refactored the project landing page into a concise English-first README with a Traditional Chinese companion (`README.zh-TW.md`).
- Moved full startup, environment, testing, and build instructions into localized Getting Started guides.
- Replaced the outdated `docs/tech_stack.md` baseline with the current v1.0.0 technology stack.
- Split environment templates by runtime: root `.env.example` for CWA ETL and `web/.env.example` for Vite / CARTO.

- README 頂部增加 Live Demo、Release 與 MIT License badges。
- Development Status 將 Gate decision 統一顯示為固定 `✅ PASS`，workflow / production evidence 移至獨立 Evidence 欄。
- 新增標準 MIT `LICENSE`，明確區分 project-owned code/docs 與第三方資料 / map services。
- 新增 documentation-only batching rule：ChatGPT / IDE Agent 應將同一輪文件修改集中成單一 consolidated commit / push，避免不必要的 GitHub Actions runs。

### Planned — v1.1.0

**主題：CARTO no-label basemap + 自製繁體中文標籤**

目標：

- 保留目前 Vite + TypeScript + Leaflet 架構。
- 保留 CARTO 作為 basemap provider。
- 將 CARTO `dark_all / light_all` 改為 no-label variant。
- 由本專案自行建立 Taiwan Traditional Chinese labels overlay。
- 優先標示台灣縣市 / 重要區域，不追求完整道路與地名資料。
- 保留 CARTO / OpenStreetMap attribution。
- 新增 label overlay 的 deterministic tests 與 Manual GIS Verification。

預計重新進入：

```text
Gate 3
  ↓
Gate 4
  ↓
Gate 5
```

Gate 1 / Gate 2 若資料來源與 ETL 未改動，可沿用 v1.0.0 已驗證 evidence。

### Planned — v1.2.0

**主題：MapTiler Dark + Traditional Chinese labels**

目標：

- 評估 MapTiler dark / data-visualization style。
- 使用 MapTiler Leaflet integration。
- 使用 Traditional Chinese language mode（`Language.TRADITIONAL_CHINESE` / zh-Hant concept）。
- 驗證 client-side API key 的 domain/referrer restriction 與部署設定。
- 重新確認 attribution、fallback、error handling 與 mobile rendering。
- 比較 CARTO 自製中文標籤與 MapTiler 原生多語系標籤的可維護性與視覺品質。

此版本屬於 GIS / basemap architecture change，因此預計重新執行：

```text
Gate 3
  ↓
Gate 4
  ↓
Gate 5
```

---

## [1.0.0] — 2026-09-25

第一個可部署、可測試、具完整 Five-Gate evidence 的 baseline release。

### Added

- CWA Open Data integration。
- Dataset：`O-A0003-001`。
- PowerShell API Client / Parser。
- PowerShell ETL pipeline。
- SQLite weather persistence。
- Static JSON export：`web/public/weather.json`。
- Vite + TypeScript frontend。
- Leaflet Taiwan GIS。
- Temperature / Humidity / Weather visualization layers。
- Layer control、legend、weather popup 與 responsive UI。
- CARTO Dark / Light basemap。
- Pester 6.2.0 test suite。
- Vitest frontend tests。
- Overall GitHub Actions CI。
- Gate 1 / Gate 2 / Gate 3 / Gate 4 verification workflows。
- Vercel production deployment。
- Scheduled data refresh workflow。

### Architecture Decisions

- CWA API Key 不進入 browser。
- Browser 不直接呼叫 CWA API。
- SQLite 不作為 Vercel runtime writable database。
- Gate 2 將資料輸出為 static JSON，Gate 3 只讀取 JSON。
- Frontend 使用 Vite + TypeScript + Leaflet，而不是 Python web runtime、React、Next.js 或 SSR。
- CI 與 Gate verification 分離：`ci.yml` 負責 repository health，各 Gate workflow 負責 milestone evidence。

### Fixed During Development

- 修正 CWA HTTP client 與 Pester Mock 不一致造成的 CI real request / 401 問題。
- Export tests 改用 isolated temporary SQLite，不再依賴本機 `data/weather.db`。
- 修正 `weather.json` UTF-8 BOM 導致 Node `JSON.parse()` 失敗。
- CI frontend dependency installation 改為 `npm ci`，使用 `package-lock.json` 提升 reproducibility。
- README 補上 Node.js、PowerShell、Pester 與完整 Quick Start。
- Gate badges 改為對應各自 workflow 的 live status。

### Known Limitations / Findings

- `O-A0003-001` 是 **Current Weather Observation**，不是 forecast dataset。
- `SQLiteHelper.psm1` 使用 Windows `winsqlite3.dll`，因此完整資料管線目前以 Windows 為主要 local environment。
- CARTO raster basemap 的 label 已包含在 tile image 中；目前 v1.0.0 的 `dark_all / light_all` 主要呈現英文 labels，無法由 Leaflet 在 client side 直接切換成繁體中文。
- `VITE_CARTO_API_KEY` 是 client-side basemap key，不等同於 `CWA_API_KEY` secret；它會存在 browser bundle / request 中，安全控制應依 provider 支援使用 domain/referrer restriction。
- 若 CARTO key 不存在，目前 basemap fallback behavior 需要在後續版本持續檢視，避免「Dark」選項實際顯示成 light-only fallback。
- UI 與 map provider attribution 必須持續保留。

### Production

- Vercel: https://twsky.vercel.app/

---

## Release Verification Policy

每一版 release 都必須至少確認：

```text
Affected Gate
    ↓
Automated Tests
    ↓
Manual Verification
    ↓
Downstream Gates
    ↓
Production Smoke Test
```

不能因為 v1.0.0 曾經 PASS，就假設後續版本自動維持 PASS。
