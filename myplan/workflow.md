---
tag: "2026.09.25-current"
status: "CURRENT"
project: "AIoT L3 CWA HW1"
repository: "https://github.com/wupojung/AIoT_L3_CWA_HW1"
description: "Five-gate workflow with testing and continuous integration"
---

# Taiwan Weather GIS — Five-Gate Development Workflow

## 1. Governing Rule

本專案固定依照以下順序：

~~~text
Gate 1 — CWA API
        ↓ PASS
Gate 2 — ETL & SQLite
        ↓ PASS
Gate 3 — Taiwan GIS Web
        ↓ PASS
Gate 4 — GitHub & Continuous Integration
        ↓ PASS
Gate 5 — Vercel Deployment
        ↓ PASS
PROJECT COMPLETE
~~~

每一 Gate 必須遵守：

~~~text
BUILD → RUN → TEST → VERIFY → PASS → NEXT GATE
~~~

若驗證失敗：

~~~text
FAIL → FIX → TEST AGAIN
~~~

未 PASS 不得進入下一 Gate。

## 2. Global Rules

1. Production data 必須來自真實 CWA Open Data。
2. 取得真實 CWA Response 前不得猜 API Schema。
3. CWA API Key 不得 Commit，也不得出現在文件、程式碼、fixture 或 log。
4. Testing 是跨 Gate 的品質要求，不另建立 Gate 6。
5. Agent 不得因為程式已產生就宣告 PASS；PASS 必須有 Verification Evidence。
6. Automated Tests 與必要 Manual Verification 必須實際執行。
7. Agent 只處理 CURRENT GATE，不得提前實作 Future Gates。
8. 本專案不使用 CRISP-DM。

---

## Gate 1 — CWA API

### Goal

驗證真實 CWA API 可用性，觀察實際 JSON Schema，並建立可獨立測試的 API Client / Parser 邊界。

### Entry Criteria

- Repository baseline 與 Secret rule 已建立。
- 可取得 CWA API Key，但 Key 尚未寫入任何 tracked file。

### Required Tasks

1. 確認目標 CWA Dataset / endpoint。
2. 由本機 `.env` 讀取 `CWA_API_KEY`。
3. 發送真實 HTTP Request。
4. 實際觀察 JSON Response；不得先猜欄位。
5. 確認專案需要的 forecast / location 資訊。
6. 依真實 Response 建立 sanitized test fixture。
7. 建立 API Client 與 Parser 的可測試邊界。

### Testing / Verification

- API Integration Test：真實 CWA request。
- Parser Unit Test：使用 sanitized real-response fixture。
- 驗證 authentication failure / invalid response 等基本錯誤行為。
- Manual Verification：Schema、時間範圍、行政區資料符合需求。

### PASS Criteria

- [ ] 真實 CWA Request 成功。
- [ ] 真實 JSON 已取得並觀察。
- [ ] Required fields / location structure 已確認。
- [ ] Parser Unit Tests PASS。
- [ ] API Integration Verification PASS。
- [ ] 無 fake production weather data。
- [ ] API Key 未出現在 tracked files / logs。

### Prohibited Actions

- 不建立正式 SQLite Schema。
- 不開始 ETL Load。
- 不開始 GIS UI。
- 不猜 API Schema。
- 不 hard-code API Key。

### Expected Output

- Verified CWA API access。
- Observed API schema notes。
- Sanitized fixture。
- Tested API Client / Parser boundary。

---

## Gate 2 — ETL & SQLite

### Goal

把 Gate 1 已驗證的 CWA Data 經 Parser / Transformer / ETL 寫入 SQLite，並能可靠查詢。

### Entry Criteria

- `GATE 1 = PASS`。
- API Schema 已由真實 Response 驗證。

### Required Tasks

1. 根據真實資料設計必要 SQLite Schema。
2. 建立 Transformer。
3. 建立 Repository boundary。
4. 建立 ETL pipeline。
5. 定義 null / missing / duplicate / refresh behavior。
6. 確保 pipeline 可重複執行。
7. 以 SQL / Repository query 驗證單一與多地區資料。

### Testing / Verification

- Transformer Unit Tests。
- Domain Logic Unit Tests。
- Repository Tests：isolated temporary SQLite。
- ETL Tests：fixture → transform → temporary SQLite → verify。
- 必要時執行真實 CWA → ETL → SQLite Integration Verification。

### PASS Criteria

- [ ] SQLite Schema 可追溯至已觀察的 CWA Data。
- [ ] Transformer tests PASS。
- [ ] Repository tests PASS。
- [ ] ETL tests PASS。
- [ ] 真實 CWA data 可成功寫入並查詢。
- [ ] Re-run 不會造成資料損壞或非預期 duplicate。
- [ ] Database 可由 pipeline 重建。

### Prohibited Actions

- 不開始 GIS implementation。
- UI 不得直接承擔 ETL。
- 不以 manual DB editing 掩蓋 pipeline bug。

### Expected Output

- Tested ETL pipeline。
- Verified SQLite database layer。
- Stable Repository interface。

---

## Gate 3 — Taiwan GIS Web

### Goal

使用 Gate 2 已驗證的資料層建立 Local Taiwan GIS Web，並正確呈現真實氣象資料。

### Entry Criteria

- `GATE 2 = PASS`。
- Database / Repository 可可靠提供應用程式需要的資料。

### Required Tasks

1. 選定符合需求且不過度複雜的 Web / GIS 技術。
2. 建立最小 Taiwan map。
3. 驗證單一 location mapping。
4. 顯示 Database weather data。
5. 擴展至需要的台灣行政區。
6. 驗證 CWA location ↔ GIS geometry mapping。
7. 加入必要 interaction、loading、empty、error state。

### Testing / Verification

- Application Logic Unit Tests。
- Location Mapping Tests。
- Basic Integration / UI Verification。
- Manual GIS Verification：地區與氣象資料對應正確。
- 不追求不必要的高 UI coverage。

### PASS Criteria

- [ ] Taiwan GIS 可在 local environment 執行。
- [ ] Weather data 來自已驗證資料層。
- [ ] Location mapping 正確且 deterministic。
- [ ] 必要 application logic tests PASS。
- [ ] Basic UI / GIS verification PASS。
- [ ] Loading / empty / error behavior 可接受。

### Prohibited Actions

- 不 hard-code production weather data。
- 不在 UI 重新實作 ETL。
- 不因畫面看起來正常就跳過 automated tests。
- 不提前進行 Production deployment。

### Expected Output

- Local Taiwan Weather GIS Web。
- Tested application / mapping logic。

---

## Gate 4 — GitHub & Continuous Integration

### Goal

讓 GitHub 成為可重現、可檢查的 Single Source of Truth，並用 GitHub Actions 自動執行必要品質檢查。

### Entry Criteria

- `GATE 3 = PASS`。
- Local application、tests、documentation 已達可重現狀態。

### Required Tasks

1. 整理 repository structure。
2. 確認 README / architecture / testing / workflow 與實作一致。
3. 確認 `.env` 未 tracked，`.env.example` 不含真正 secret。
4. 由 clean clone 驗證 setup。
5. 在 `.github/workflows/ci.yml` 啟用實際 toolchain 所需的 install / lint / test / build。
6. Push / Pull Request 自動觸發 CI。

### Testing / Verification

- GitHub Actions：Lint。
- GitHub Actions：Automated Tests。
- GitHub Actions：Build。
- Clean-clone verification。
- Secret / tracked-file check。

### PASS Criteria

- [ ] GitHub Actions workflow 已執行。
- [ ] Lint PASS。
- [ ] Automated Tests PASS。
- [ ] Build PASS。
- [ ] Clean clone 可重現。
- [ ] `.env` 未 tracked。
- [ ] 文件與實作一致。

### Prohibited Actions

- 不刪除 failing tests 來取得綠燈。
- 不降低 assertion 只為 PASS。
- 不 Commit secrets。
- 不用 README 的狀態文字取代真正 CI evidence。

### Expected Output

- Reproducible GitHub repository。
- Green GitHub Actions CI run。

---

## Gate 5 — Vercel Deployment

### Goal

將 Gate 4 已驗證版本部署至 Vercel，並驗證 Production environment。

### Entry Criteria

- `GATE 4 = PASS`。
- GitHub Actions 對目標 commit 為 PASS。

### Required Tasks

1. GitHub repository 連接 Vercel。
2. 設定 build / environment variables。
3. 建立 deployment。
4. 驗證 public URL。
5. 執行 Production Smoke Test。
6. 確認 GitHub → Vercel deployment workflow。

### Testing / Verification

- Deployment build verification。
- Public URL smoke test。
- Taiwan GIS load verification。
- Weather data availability verification。
- Runtime error check。

### PASS Criteria

- [ ] Vercel build PASS。
- [ ] Public URL reachable。
- [ ] Taiwan GIS 可使用。
- [ ] Weather data 可正常呈現。
- [ ] 無 blocking runtime error。
- [ ] Secret 未暴露。

### Prohibited Actions

- 不把 Production 當開發環境。
- 不因 Vercel 顯示 deploy success 就省略 smoke test。
- 不把 local SQLite file 未經驗證地視為永久 writable production database。

### Expected Output

- Verified Production deployment。

---

## Final Completion Criteria

只有以下全部成立才可回報 Project Complete：

- [ ] Gate 1 PASS
- [ ] Gate 2 PASS
- [ ] Gate 3 PASS
- [ ] Gate 4 PASS
- [ ] Gate 5 PASS
- [ ] Real CWA Data used
- [ ] Automated verification evidence available
- [ ] No secret exposed

~~~text
AIoT L3 CWA HW1 = COMPLETE
~~~