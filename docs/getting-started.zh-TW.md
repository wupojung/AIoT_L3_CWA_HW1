# 詳細啟動指南

[English](getting-started.md) | **繁體中文**

本文件說明 Frontend Preview、完整 CWA 資料管線、測試與 Production Build。

## 1. 環境需求

### 只執行 Frontend

- Git
- Node.js 20.x
- npm

### 執行完整資料管線

- Windows 10 / 11
- 建議使用 PowerShell 7+
- Pester 6.2.0
- CWA API Key
- Node.js 20.x

目前 SQLite helper 使用 Windows `winsqlite3.dll`，因此完整 ETL pipeline 目前以 Windows 為主要執行環境。

## 2. Clone Repository

```bash
git clone https://github.com/wupojung/AIoT_L3_CWA_HW1.git
cd AIoT_L3_CWA_HW1
```

## 3. Frontend Preview

Repository 已包含 `web/public/weather.json`，因此只看 GIS 畫面時不需要重新呼叫 CWA API。

```bash
cd web
npm ci
npm run dev
```

Vite 會顯示 Local Development URL，通常為：

```text
http://localhost:5173
```

### CARTO Basemap Key（選用）

若沒有設定 CARTO key，目前系統會 fallback 到 OpenStreetMap。

若要在本機使用 CARTO Dark / Light：

```powershell
cd web
Copy-Item .env.example .env
```

設定：

```env
VITE_CARTO_API_KEY=<YOUR_CARTO_API_KEY>
```

`VITE_` 變數會進入 Browser Bundle，因此屬於 client-side configuration。若 provider 支援，應設定 domain / referrer restriction。

## 4. 完整 CWA → SQLite → JSON Pipeline

### 4.1 設定 CWA API Key

在 repository root：

```powershell
Copy-Item .env.example .env
```

設定：

```env
CWA_API_KEY=<YOUR_CWA_API_KEY>
```

Root `.env` 由 `src/Run-Etl.ps1` 使用。

### 4.2 執行 ETL

```powershell
./src/Run-Etl.ps1
```

預期產生：

```text
data/weather.db
```

### 4.3 匯出 Frontend JSON

```powershell
./src/Export-WeatherJson.ps1
```

預期產生 / 更新：

```text
web/public/weather.json
```

### 4.4 啟動 Frontend

```powershell
cd web
npm ci
npm run dev
```

## 5. Testing

### PowerShell / Data Layer

安裝專案固定版本 Pester：

```powershell
Install-Module Pester -RequiredVersion 6.2.0 -Scope CurrentUser -Force
Import-Module Pester -RequiredVersion 6.2.0 -Force
```

執行 PowerShell tests：

```powershell
Invoke-Pester -Path ./tests -Output Detailed
```

CI mode：

```powershell
Invoke-Pester -Path ./tests -CI -Output Detailed
```

### Frontend

在 `web/`：

```bash
npm ci
npx tsc --noEmit
npm run test -- --run
npm run build
```

## 6. Production Build

```bash
cd web
npm ci
npm run build
```

輸出位置：

```text
web/dist/
```

主要 artifacts：

```text
web/dist/index.html
web/dist/weather.json
```

本機預覽 Production Build：

```bash
npm run preview
```

## 7. Environment Files

| File | 用途 |
| --- | --- |
| `/.env` | 本機 CWA ETL secret |
| `/.env.example` | CWA environment template |
| `/web/.env` | 本機 Vite / CARTO 設定 |
| `/web/.env.example` | Frontend environment template |

真正的 `.env` 不得 commit。

## 8. 相關文件

- [繁中 README](../README.zh-TW.md)
- [Architecture](architecture.md)
- [Technology Stack](tech_stack.md)
- [Testing Strategy](testing.md)
- [Five-Gate Workflow](../myplan/workflow.md)
