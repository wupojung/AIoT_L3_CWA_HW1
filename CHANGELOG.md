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

### Planned — v1.1.0

**Theme: Complete O-A0003 observation model + bilingual GIS**

v1.1.0 expands the reduced v1.0 data contract so verified O-A0003-001 station fields are preserved through Parser → SQLite → JSON and presented through an English / Traditional Chinese GIS.

Primary map layers:

```text
Temperature
Humidity
Precipitation
Wind
Pressure
UV Index
Weather
```

Full station metadata, visibility, sunshine duration, gust information, maximum 10-minute wind, and daily high / low temperatures will be available in a structured Station Detail panel.

Because the parser, database schema, JSON contract, and GIS UI all change, this release re-enters from Gate 1:

```text
Gate 1 → Gate 2 → Gate 3 → Gate 4 → Gate 5
```

See `docs/releases/v1.1.0.md` and `docs/releases/v1.1.0.zh-TW.md`.

### Planned — v1.2.0

**Theme: CARTO no-label + custom Traditional Chinese map labels**

The former v1.1 localization roadmap moves to v1.2.0.

### Planned — v1.3.0

**Theme: MapTiler Dark + native Traditional Chinese labels**

The former v1.2 MapTiler roadmap moves to v1.3.0.

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
