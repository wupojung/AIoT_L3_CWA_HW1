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
5. Continuous Integration 也是跨 Gate 品質機制，不等待 Gate 4 才開始。
6. 只要某個 Gate 已產生可重複執行的 Automated Tests，就應納入 GitHub Actions。
7. Local 與 CI 必須執行同一套 Automated Test Suite。
8. PowerShell Automated Tests 統一使用 Pester 6.2.0，新的或修改過的 Assertions 使用 Pester 6 `Should-*` syntax。
9. Agent 不得因為程式已產生就宣告 PASS；PASS 必須有 Verification Evidence。
10. Automated Tests 與必要 Manual Verification 必須實際執行。
11. Agent 只處理 CURRENT GATE，不得提前實作 Future Gates。
12. 本專案不使用 CRISP-DM。
13. 由 ChatGPT / IDE Agent 執行 **文件型修改（documentation-only changes）** 時，應先完成同一輪審閱與編輯，再以單一 consolidated commit / push 提交；不得每修改一個段落、badge 或格式就立即 push。
14. 文件修改 batching 的目的，是避免每次 push 都觸發 GitHub Actions，造成不必要的 CI run、等待時間與運算資源消耗。例外僅限：使用者明確要求立即驗證、security / secret fix、或該變更需要獨立保留 verification evidence。
15. `README.md` 為預設英文專案首頁；繁體中文使用 `README.zh-TW.md`。兩份 README 的核心功能、版本、Quick Start、Gate Status、文件連結與 License 必須保持一致。
16. README 只保留專案首頁需要的摘要與最短 Quick Start；完整 setup、environment、testing、build instructions 放入 `docs/getting-started*.md`，避免 README 膨脹成操作手冊。
17. 任何修改 `README.md` 或 `README.zh-TW.md` 的工作，都必須在同一個 documentation batch 中同步檢查另一語系版本；不得讓 release、roadmap、Quick Start、Gate Status、Live Demo、License 或 documentation links 發生 language drift。

## 3. Versioned Release / Gate Re-entry Policy

Five-Gate Workflow 是 **每個 release 的品質驗證模型**，不是一次性且不可回頭的線性流程。

第一個完整 baseline release 定義為：

~~~text
v1.0.0
~~~

當後續版本修改既有功能時，先找出「最早受影響的 Gate」，再從該 Gate 重新執行：

~~~text
BUILD → RUN → TEST → VERIFY → PASS
~~~

並重新驗證所有 downstream Gates。

### Rule

~~~text
Version Change
     ↓
Earliest Affected Gate
     ↓
Affected Gate Verification
     ↓
All Downstream Gates
     ↓
New Release
~~~

### Examples

v1.1.0：完整 O-A0003 observation contract + English / Traditional Chinese GIS：

~~~text
Gate 1
  ↓
Gate 2
  ↓
Gate 3
  ↓
Gate 4
  ↓
Gate 5
~~~

Dataset ID 雖然不變，但 Parser contract、SQLite schema、Static JSON 與 GIS UI 都會擴充，因此最早受影響 Gate 是 Gate 1。

v1.2.0：CARTO no-label + 自製繁體中文 map labels：

~~~text
Gate 3
  ↓
Gate 4
  ↓
Gate 5
~~~

v1.3.0：MapTiler Dark + Traditional Chinese labels：

~~~text
Gate 3
  ↓
Gate 4
  ↓
Gate 5
~~~

v1.2 / v1.3 主要修改 frontend GIS / basemap integration，因此從 Gate 3 重新執行 automated + manual GIS verification，並重新驗證 CI 與 Production。

若未來改用新的 CWA forecast dataset：

~~~text
Gate 1
  ↓
Gate 2
  ↓
Gate 3
  ↓
Gate 4
  ↓
Gate 5
~~~

### Release Documentation

每次 release 至少同步更新：

- `CHANGELOG.md`
- `docs/technology-decisions.md`（若有新的技術決策）
- `docs/architecture.md`（若 architecture 有變動）
- `README.md`（若 setup、runtime、feature 或 deployment 有變動）

舊版本的 PASS evidence 不得被當成新版本自動 PASS 的證明。

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
- 可重複的 Unit Tests 應納入 GitHub Actions。

### PASS Criteria

- [ ] 真實 CWA Request 成功。
- [ ] 真實 JSON 已取得並觀察。
- [ ] Required fields / location structure 已確認。
- [ ] Parser Unit Tests PASS。
- [ ] API Integration Verification PASS。
- [ ] 可重複 Tests 在 Local 與 GitHub Actions 均可執行。
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
- Local PowerShell 使用 Pester 6.2.0 執行 Automated Tests。
- GitHub Actions 執行同一套 Pester tests。

### PASS Criteria

- [ ] SQLite Schema 可追溯至已觀察的 CWA Data。
- [ ] Transformer tests PASS。
- [ ] Repository tests PASS。
- [ ] ETL tests PASS。
- [ ] Local Pester tests PASS。
- [ ] GitHub Actions Pester tests PASS。
- [ ] 真實 CWA data 可成功寫入並查詢。
- [ ] Re-run 不會造成資料損壞或非預期 duplicate。
- [ ] Database 可由 pipeline 重建。

### Prohibited Actions

- 不開始 GIS implementation。
- UI 不得直接承擔 ETL。
- 不以 manual DB editing 掩蓋 pipeline bug。
- 不刪除或弱化 failing tests 取得綠燈。

### Expected Output

- Tested ETL pipeline。
- Verified SQLite database layer。
- Stable Repository interface。
- Green Gate 2 CI evidence。

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
- 可自動化的 Gate 3 tests 納入既有 CI。
- 不追求不必要的高 UI coverage。

### PASS Criteria

- [ ] Taiwan GIS 可在 local environment 執行。
- [ ] Weather data 來自已驗證資料層。
- [ ] Location mapping 正確且 deterministic。
- [ ] 必要 application logic tests PASS。
- [ ] GitHub Actions 對相關 automated tests 為 PASS。
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

完成 **CI Hardening / Final Repository Verification**，讓 GitHub 成為可重現、可檢查的 Single Source of Truth。

Gate 4 不是第一次建立 CI。GitHub Actions 應從前面 Gate 持續執行；Gate 4 負責確認所有必要品質檢查已完整納入並穩定通過。

### Entry Criteria

- `GATE 3 = PASS`。
- Local application、tests、documentation 已達可重現狀態。
- 前面 Gate 的 automated tests 已持續在 CI 執行。

### Required Tasks

1. 整理 repository structure。
2. 確認 README / architecture / testing / workflow 與實作一致。
3. 確認 `.env` 未 tracked，`.env.example` 不含真正 secret。
4. 由 clean clone 驗證 setup。
5. 確認 `.github/workflows/ci.yml` 已涵蓋實際 toolchain 所需的 test / lint / build。
6. Push / Pull Request 自動觸發 CI。
7. 確認 README CI Badge 正確反映 main branch workflow 狀態。

### Testing / Verification

- GitHub Actions：Repository baseline。
- GitHub Actions：Automated Tests。
- GitHub Actions：Lint（若 toolchain 已提供）。
- GitHub Actions：Build（若應用程式已需要 build）。
- Clean-clone verification。
- Secret / tracked-file check。

### PASS Criteria

- [ ] 所有 Required Automated Tests 已納入 CI。
- [ ] GitHub Actions 對目前 main commit 為 PASS。
- [ ] Local Test 與 CI 使用一致 Test Suite。
- [ ] Lint PASS（若適用）。
- [ ] Build PASS（若適用）。
- [ ] Clean clone 可重現。
- [ ] `.env` 未 tracked。
- [ ] README CI Badge 可正確顯示 Workflow 狀態。
- [ ] 文件與實作一致。

### Prohibited Actions

- 不刪除 failing tests 來取得綠燈。
- 不降低 assertion 只為 PASS。
- 不 Commit secrets。
- 不用 README 的狀態文字取代真正 CI evidence。

### Expected Output

- Reproducible GitHub repository。
- Green GitHub Actions CI run。
- README live CI status badge。

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
