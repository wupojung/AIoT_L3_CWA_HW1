---
tag: "2026.09.24-current"
status: "CURRENT"
project: "AIoT L3 CWA HW1"
repository: "https://github.com/wupojung/AIoT_L3_CWA_HW1"
description: "Five-gate Taiwan Weather GIS development workflow"
reference: "Adapted from instructor workflow structure"
---

# Taiwan Weather GIS — Development Workflow

> **Status: CURRENT / ACTIVE**
>
> 本文件為目前專案開發流程基準。Antigravity 與後續開發應依照本版本執行，除非之後有新版 workflow 明確取代。
>
> Target Repository:
>
> `https://github.com/wupojung/AIoT_L3_CWA_HW1`

---

# 1. Governing Rule

本專案嚴格依照下列五個 Gate 開發：

```text
Gate 1 — CWA API
        ↓ PASS
Gate 2 — Database
        ↓ PASS
Gate 3 — Local Taiwan GIS
        ↓ PASS
Gate 4 — GitHub
        ↓ PASS
Gate 5 — Vercel
        ↓ PASS
PROJECT COMPLETE
```

## Core Development Loop

每一個 Gate 都必須遵守：

```text
Previous Gate
      ↓
BUILD
      ↓
RUN
      ↓
TEST
      ↓
VERIFY
      ↓
PASS?
 ┌────┴────┐
 NO        YES
 ↓          ↓
FIX      NEXT GATE
 ↓
RE-RUN
 ↓
RE-TEST
```

**DO NOT BUILD EVERYTHING AT ONCE.**

如果目前 Gate 尚未通過驗證：

```text
FAIL = STOP
```

不得因為下一階段「看起來可以做」就直接繼續。

---

# 2. Development Principles

本專案採用：

```text
Spec-Driven
+
Testable Architecture
+
AI-Assisted Development
+
Verification-Gated Workflow
```

每一階段的 PASS 必須代表：

```text
Requirement satisfied
+
Implementation completed
+
Program actually executed
+
Required tests actually executed
+
Verification evidence available
+
No blocking issue
```

以下敘述不算 PASS：

```text
"It should work."
"Tests should pass."
"The code looks correct."
"Implementation is complete."
```

必須實際：

```text
RUN → TEST → VERIFY
```

後才能回報 PASS。

---

# 3. Global Rules

## 3.1 Real CWA Data Only

正式系統必須使用：

```text
CWA Open Data
```

不得使用自製假天氣資料取代正式 CWA API Integration。

Unit Test 可以使用：

- fixture
- mock HTTP response
- sanitized real-response sample

但它們只能用於測試。

---

## 3.2 Do Not Guess API Schema

在真正取得 CWA API Response 前：

```text
DO NOT GUESS JSON SCHEMA
```

Parser 必須建立在實際觀察過的 CWA Response 上。

流程必須是：

```text
Real API Response
        ↓
Inspect Schema
        ↓
Define Data Contract
        ↓
Implement Parser
```

不得反過來。

---

## 3.3 Secret Management

CWA API Key 不得出現在：

- Source Code
- README
- Markdown 文件
- Test Fixture
- Log
- Screenshot
- Git Commit
- GitHub Repository

本機使用：

```env
CWA_API_KEY=<YOUR_CWA_API_KEY>
```

正式實作時必須提供：

```text
.env
.env.example
.gitignore
```

其中：

- `.env`：存放真正 Secret，不得 Commit。
- `.env.example`：只放變數名稱與假值，不得包含真正 API Key。
- `.gitignore`：必須排除 `.env`。

---

## 3.4 AI Coding Rule

Google Antigravity 或其他 Coding Agent 每次只能處理：

```text
CURRENT GATE ONLY
```

禁止：

```text
IMPLEMENT FUTURE GATES
```

AI 不得因為「下一步很明顯」而自行進入下一 Gate。

每一 Gate 完成後：

```text
VERIFY
↓
REPORT RESULT
↓
STOP
```

確認 PASS 後才能繼續。

---

# Gate 1 — CWA API

## Goal

確認系統可以安全且可靠地取得真實 CWA Open Data，並建立後續 Database / ETL 所需要的真實資料理解。

本 Gate 的目標不是建立 Database，也不是製作 GIS。

---

## Input

- CWA Open Data API
- CWA API Documentation
- CWA API Key
- Project Requirements

參考老師版本，目前目標 Dataset 為：

```text
F-D0047-093
```

預期用途：

```text
Taiwan township / district weather forecast
```

但實作時仍必須以 CWA 官方實際 API Response 為準，不得只依照文件名稱猜測 Schema。

---

## Main Tasks

1. 確認 Dataset `F-D0047-093` 的官方 endpoint 與目前可用性。
2. 建立 Secret Management。
3. 從 `.env` 取得 `CWA_API_KEY`。
4. 發送真實 CWA API HTTP Request。
5. 驗證 HTTP Response Status。
6. 取得真正 JSON Response。
7. 檢查實際 JSON Schema。
8. 確認 location / administrative area structure。
9. 確認 Forecast 時間範圍。
10. 確認專案需要的主要天氣資訊是否存在，例如：
    - Temperature
    - Maximum Temperature
    - Minimum Temperature
    - Weather Description
    - Probability of Precipitation
11. 使用一個最小行政區作為初始驗證案例。
12. 再確認資料可以涵蓋台灣所需行政區域。
13. 建立可供 Parser / ETL 測試使用的 sanitized fixture。
14. 建立 API Client 與 Parser 的測試邊界。
15. 實際 Run / Test / Verify。

---

## Unit Testing Direction

### API Client

適合測試：

```text
HTTP success
HTTP failure
timeout
invalid response
authentication failure
```

Unit Test 可以 mock HTTP。

真正 CWA Request 屬於 Integration Test。

### Parser

非常適合 Unit Test。

Fixture 必須來自：

```text
Observed Real CWA Response
```

可以測試：

```text
valid response
missing field
null field
unexpected structure
empty collection
```

---

## Expected Output

```text
CWA API
   ↓
Real JSON
   ↓
Observed Schema
   ↓
Parser-ready Data Contract
```

並留下：

- Dataset confirmation
- API request verification
- sanitized response fixture
- observed schema notes
- required field inventory
- known edge cases

---

## Gate 1 PASS Criteria

只有以下項目全部完成，才能宣告：

```text
GATE 1 = PASS
```

Checklist：

```text
[ ] Dataset / endpoint confirmed
[ ] CWA authentication succeeds
[ ] Real HTTP request executed
[ ] HTTP response succeeds
[ ] Real JSON received
[ ] Actual JSON schema inspected
[ ] Required forecast time range confirmed
[ ] Required weather elements confirmed
[ ] Administrative location structure confirmed
[ ] Taiwan coverage requirement confirmed
[ ] Test fixture comes from observed real response
[ ] API Client test boundary defined
[ ] Parser test boundary defined
[ ] No fake weather data used as production data
[ ] No API Key exposed
```

---

## Failure Handling

如果 API 或 Schema 與預期不同：

```text
STOP
↓
Inspect Real Response
↓
Update Understanding
↓
Fix Current Gate
↓
RUN
↓
TEST
↓
VERIFY
```

不得修改假資料來假裝成功。

---

## Must NOT Do

Gate 1 禁止：

- 建立正式 SQLite Database
- 開始 ETL Load
- 建 GIS
- 製作完整前端
- 部署 Vercel
- 猜 JSON Schema
- Hard-code API Key
- 用 fake weather data 代替 CWA

---

# Gate 2 — Database

## Entry Criteria

必須先：

```text
GATE 1 = PASS
```

否則不得開始。

---

## Goal

將 Gate 1 已驗證的真實 CWA Data 轉換成可以可靠儲存與查詢的 SQLite 資料。

建立完整流程：

```text
CWA JSON
   ↓
Parse
   ↓
Transform
   ↓
Validate
   ↓
SQLite
```

---

## Input

- Gate 1 verified CWA response
- Observed JSON Schema
- Sanitized fixture
- Required weather fields
- Location structure

---

## Main Tasks

1. 根據真實 CWA Schema 設計資料模型。
2. 設計 SQLite Schema。
3. 定義 Parser responsibility。
4. 定義 Transformer responsibility。
5. 定義 Repository responsibility。
6. 建立 ETL：
   - Extract
   - Transform
   - Load
7. 處理：
   - Null
   - Missing value
   - Duplicate
   - Refresh / update
8. 確保 ETL 可以重複執行。
9. 用 SQL SELECT 驗證資料。
10. 驗證單一地區。
11. 驗證多個地區。
12. 驗證時間資料。
13. 驗證重要氣象欄位。
14. 建立 automated tests。

---

## Testable Components

### Parser

```text
Input JSON
→ Expected parsed data
```

應該可以 Pure Unit Test。

### Transformer

```text
Parsed data
→ Domain / DB-ready record
```

應該盡量保持 Pure Function。

### Domain Logic

適合 Unit Test。

### Repository

使用：

```text
Temporary / Isolated SQLite
```

測試：

- Insert
- Update
- Query
- Duplicate handling

### ETL

使用：

```text
Fixture
+
Temporary SQLite
```

做 Integration Test。

---

## Expected Output

```text
Verified CWA Data
        ↓
ETL Pipeline
        ↓
SQLite Database
        ↓
Verified Query Result
```

---

## Gate 2 PASS Criteria

```text
[ ] SQLite schema created from observed CWA data
[ ] Parser test passes
[ ] Transformer test passes
[ ] Repository test passes
[ ] ETL test passes
[ ] Real CWA data successfully loaded
[ ] Single-location query verified
[ ] Multi-location query verified
[ ] Required weather fields verified
[ ] Duplicate strategy verified
[ ] Re-running ETL does not corrupt data
[ ] Database can be rebuilt from pipeline
[ ] No fake weather data used as production data
```

完成後才可宣告：

```text
GATE 2 = PASS
```

---

## Failure Handling

若資料不正確：

```text
Identify Layer
↓
Parser?
Transformer?
Validation?
Repository?
ETL?
↓
Fix Responsible Layer
↓
Run Tests
↓
Verify Database Again
```

---

## Must NOT Do

Gate 2 禁止：

- 開始 Taiwan GIS
- UI 直接解析 CWA JSON
- UI 直接呼叫 CWA 當作正式資料流程
- Manual 修改 DB 來掩蓋 ETL Bug
- 把 Parser / Transformer / DB 全塞進同一個巨大 Function

---

# Gate 3 — Local Taiwan GIS

## Entry Criteria

必須先：

```text
GATE 2 = PASS
```

---

## Goal

使用 Gate 2 已驗證的 Database Data，建立可以在本機執行的 Taiwan Weather GIS Application。

Weather 顯示來源必須是：

```text
Database
```

而不是 hard-coded weather data。

---

## Development Order

依照老師 Five-Gate Workflow 的精神，本 Gate 再拆成小步驟：

```text
3A — Taiwan Map
3B — One Location
3C — Weather Popup
3D — Multiple Taiwan Locations
3E — Database → GIS
3F — Taiwan GeoJSON
3G — Interactive Dashboard
```

每一小步仍遵守：

```text
BUILD
→ RUN
→ TEST
→ VERIFY
```

---

## 3A — Taiwan Map

先確認 Taiwan Map 可以正常呈現。

可考慮：

```text
Leaflet
+
OpenStreetMap
```

但實作階段仍可依專案實際需求調整。

PASS：

```text
[ ] Map renders locally
[ ] Taiwan visible
[ ] No blocking browser error
```

---

## 3B — One Location

加入一個最小 location mapping。

目的是驗證：

```text
Application Location
↔
Map Position / Region
```

PASS：

```text
[ ] One selected Taiwan location displays correctly
```

---

## 3C — Weather Popup

將 Database 中的 Weather Data 顯示到 GIS UI。

PASS：

```text
[ ] Weather information comes from Database
[ ] Popup / information panel displays expected data
```

---

## 3D — Multiple Taiwan Locations

將資料擴展到多個行政區域。

PASS：

```text
[ ] Multiple locations load correctly
[ ] Mapping is deterministic
[ ] No hard-coded production weather
```

---

## 3E — Database → GIS

正式整合：

```text
SQLite
↓
Application Data Layer
↓
GIS
```

PASS：

```text
[ ] GIS reads verified database data
[ ] Selected region returns correct weather
```

---

## 3F — Taiwan GeoJSON

加入 Taiwan geographic boundary data。

必須確認：

```text
CWA Location
↔
GIS Geometry
```

Mapping Key 的可靠性。

不得只因名稱「看起來一樣」就假設一定可以 Join。

PASS：

```text
[ ] Administrative area mapping verified
[ ] GeoJSON renders correctly
[ ] Weather-to-region mapping verified
```

---

## 3G — Interactive Dashboard

最後才加入：

- region interaction
- weather display
- loading state
- empty state
- error state
- basic dashboard UX

---

## Unit Testing Direction

適合 Unit Test：

- Location Mapping
- Domain Formatting
- Filtering
- Selection Logic
- Display Transformation

Integration / UI Verification：

- Map Rendering
- Region Selection
- Weather Popup
- GeoJSON Interaction

不需要測 Leaflet 本身。

要測的是：

```text
Our GIS Integration Logic
```

---

## Expected Output

Local environment：

```text
SQLite
↓
Taiwan GIS
↓
Real CWA Weather
↓
Interactive UI
```

---

## Gate 3 PASS Criteria

```text
[ ] Taiwan Map renders
[ ] One-location verification passes
[ ] Weather popup works
[ ] Multiple locations work
[ ] Data comes from Database
[ ] Taiwan GeoJSON works
[ ] CWA location ↔ GIS region mapping verified
[ ] Interactive dashboard works
[ ] Loading / empty / error states handled
[ ] Local application runs from clean setup
[ ] Required automated tests pass
[ ] No fake production weather data
```

完成才可宣告：

```text
GATE 3 = PASS
```

---

## Failure Handling

遇到 GIS 錯誤必須先分類：

```text
Database Problem?
Location Mapping Problem?
GeoJSON Problem?
Application Logic Problem?
UI Problem?
GIS Library Problem?
```

修正後重新：

```text
RUN → TEST → VERIFY
```

---

## Must NOT Do

Gate 3 禁止：

- 因畫面看起來正常就宣告 PASS
- Hard-code production weather
- 在 UI 重做 ETL
- 修改 Database 來配合畫面假裝正確
- 尚未 Local PASS 就部署 Vercel

---

# Gate 4 — GitHub

## Entry Criteria

必須先：

```text
GATE 3 = PASS
```

---

## Goal

整理專案 Repository，使 GitHub 成為可重現、可檢查、安全的專案版本。

Target Repository：

```text
https://github.com/wupojung/AIoT_L3_CWA_HW1
```

---

## Main Tasks

1. 整理 Repository Structure。
2. 確認 source code。
3. 確認 automated tests。
4. 整理 README。
5. 整理 `myplan/workflow.md`。
6. 提供 `.env.example`。
7. 確認 `.gitignore`。
8. 確認 dependency / setup instructions。
9. 從 clean clone 驗證專案可以重新安裝與執行。
10. 執行全部 automated tests。
11. 執行 secret inspection。
12. 確認 Git history 沒有 API Key。
13. Commit。
14. Push GitHub。
15. 再從 GitHub Repository 驗證內容。

---

## Recommended Repository Responsibilities

README 應該回答：

```text
What is this project?
How do I install it?
How do I configure environment variables?
How do I run it?
How do I test it?
```

`myplan/workflow.md` 則負責：

```text
Development Gates
PASS Criteria
AI Agent Rules
Verification Rules
```

不要把大量 temporary debug log 塞進 README。

---

## Verification

必須進行：

```text
Clean Clone
↓
Install
↓
Configure .env
↓
Run
↓
Test
↓
Verify
```

另外確認：

```text
git status
```

與 GitHub 上的 repository content 一致。

---

## Gate 4 PASS Criteria

```text
[ ] Repository structure reviewed
[ ] README exists and matches actual project
[ ] workflow.md exists
[ ] .env is NOT tracked
[ ] .env.example contains no real secret
[ ] .gitignore configured
[ ] No API Key exists in current repository files
[ ] Git history checked for secrets
[ ] Clean clone works
[ ] Application runs
[ ] Automated tests pass
[ ] Required files pushed to target repository
[ ] GitHub repository reflects verified local state
```

完成才可宣告：

```text
GATE 4 = PASS
```

---

## Failure Handling

例如：

```text
Secret detected
→ STOP
→ Remove secret
→ Rotate exposed credential if necessary
→ Clean repository/history as required
→ Re-verify
```

若 clean clone 無法執行：

```text
Documentation / dependency / path issue
→ Fix
→ Clone again
→ Re-test
```

---

## Must NOT Do

Gate 4 禁止：

- Commit `.env`
- Commit 真正 API Key
- Push 尚未通過 Gate 3 的版本
- 為了 GitHub 顯示正常而刪除 failing tests
- README 與實際執行方式不一致

---

# Gate 5 — Vercel

## Entry Criteria

必須先：

```text
GATE 4 = PASS
```

---

## Goal

將 GitHub 上已驗證的版本部署到 Vercel，並確認公開環境可以正常執行。

---

## Main Tasks

1. 將 GitHub Repository 連接至 Vercel。
2. 設定 Build Configuration。
3. 設定必要 Environment Variables。
4. 不得把真正 API Key 寫入 Source Code。
5. 建立 Preview Deployment。
6. 執行 Preview Smoke Test。
7. 修正 deployment-specific issue。
8. 建立 Production Deployment。
9. 驗證 Production URL。
10. 執行 Production Smoke Test。
11. 驗證 GIS。
12. 驗證 Weather Data。
13. 驗證後續 GitHub Push 是否能觸發預期 Deployment Workflow。

---

## SQLite Deployment Constraint

本機 SQLite 不應直接假設可以作為 Vercel Production 的永久可寫資料庫。

在 Gate 5 必須依照前面確認過的 Application Architecture 處理。

如果系統只需要：

```text
Pre-generated / read-only data artifact
```

則需驗證部署方式。

如果 Production 需要：

```text
Continuous ETL
+
Persistent Write
```

則必須重新確認適合的 Production Persistence Strategy。

禁止在沒有驗證的情況下假設：

```text
Local SQLite file
=
Persistent Vercel Production Database
```

---

## Testing / Verification

主要使用：

```text
Build Verification
+
Preview Smoke Test
+
Production Smoke Test
+
Acceptance Verification
```

至少驗證：

```text
Public URL
Page Load
Taiwan GIS
Weather Data
Environment Variables
Runtime Error
```

---

## Gate 5 PASS Criteria

```text
[ ] Vercel connected to correct GitHub repository
[ ] Build succeeds
[ ] Environment Variables configured safely
[ ] Preview deployment works
[ ] Production deployment works
[ ] Public URL reachable
[ ] Taiwan GIS loads
[ ] Weather information loads
[ ] No API Key exposed to repository/log/output
[ ] No blocking runtime error
[ ] Deployment architecture matches SQLite strategy
[ ] GitHub → Vercel deployment workflow verified
```

完成才可宣告：

```text
GATE 5 = PASS
```

---

## Failure Handling

Deployment Failure 時先分類：

```text
Build?
Dependency?
Environment Variable?
Path?
Runtime?
Storage?
Network?
Application?
```

不得隨機修改 Application Code。

流程：

```text
Identify Root Cause
↓
Fix Responsible Layer
↓
Run Local Regression Tests
↓
Push Verified Fix
↓
Redeploy
↓
Verify
```

---

## Must NOT Do

Gate 5 禁止：

- 在 Production 直接嘗試未驗證程式
- 把 Secret 寫進 Repository
- 跳過 Preview / Smoke Test
- 因為 Vercel 顯示 Deployment Success 就直接宣告 Project PASS
- 忽略 GIS / Weather Data 實際功能驗證

---

# 4. CRISP-DM Mapping

本專案不是 Machine Learning Project。

CRISP-DM 在此專案採用工程化對應：

| CRISP-DM | Project Mapping |
|---|---|
| Business Understanding | Project requirements / Five-Gate acceptance criteria |
| Data Understanding | Gate 1 — CWA API |
| Data Preparation | Gate 2 — Parser / Transformer / ETL / SQLite |
| Modeling | Gate 2–3 — Domain representation / GIS mapping / application data model |
| Evaluation | Gate 1–5 各 Gate 的 RUN / TEST / VERIFY |
| Deployment | Gate 4–5 — GitHub / Vercel |

其中：

```text
Modeling
```

不是 Machine Learning Model。

在本專案代表：

```text
CWA Data
↓
Application Data Model
↓
Database Representation
↓
Geographical Representation
↓
User-facing Weather Information
```

---

# 5. AI Coding Risk Controls

## Risk 1 — Building Too Much

AI 可能一次建立：

```text
API + Database + GIS + Deployment
```

Control：

```text
CURRENT GATE ONLY
```

---

## Risk 2 — Hallucinated API Schema

Control：

```text
Real Response First
↓
Parser Second
```

---

## Risk 3 — Fake Verification

以下不算驗證：

```text
"should pass"
"looks correct"
```

必須提供真正 execution result。

---

## Risk 4 — Weakening Tests to Get PASS

禁止：

```text
Failing Test
↓
Delete Test
```

正確流程：

```text
Failing Test
↓
Find Root Cause
↓
Fix Implementation
↓
Re-run
```

---

## Risk 5 — Secret Leakage

任何 AI Agent 都不得把 Secret 放入：

```text
Source
Markdown
README
Fixture
Log
Git
```

---

## Risk 6 — Gate Skipping

流程固定：

```text
IMPLEMENT
↓
RUN
↓
TEST
↓
VERIFY
↓
PASS
↓
STOP
```

下一 Gate 必須明確開始，不得自行連續實作。

---

# 6. PASS Reporting Format

每個 Gate 完成時，AI Agent 應使用類似格式：

```text
GATE X VERIFICATION

Implementation:
- ...

Tests Executed:
- ...

Verification:
- ...

Failures:
- None

Security Check:
- PASS

Gate Status:
GATE X = PASS
```

如果失敗：

```text
Gate Status:
GATE X = FAIL

Blocking Issue:
...

Next Action:
Fix current Gate only.
```

禁止 FAIL 時繼續下一 Gate。

---

# 7. Final Project Flow

```text
Gate 1 — CWA API
Real CWA Data
Observed Schema
Verified API Integration
        ↓ PASS

Gate 2 — Database
Parser
Transformer
ETL
SQLite
Automated Tests
        ↓ PASS

Gate 3 — Local Taiwan GIS
Taiwan Map
Database → GIS
GeoJSON
Interactive Weather UI
        ↓ PASS

Gate 4 — GitHub
Repository Cleanup
Documentation
Security Check
Clean Clone Verification
Push
        ↓ PASS

Gate 5 — Vercel
Preview
Production
Smoke Test
Public Verification
        ↓ PASS

PROJECT COMPLETE
```

---

# 8. Final Completion Criteria

只有五個 Gate 全部 PASS 才可以回報：

```text
AIoT L3 CWA HW1 = COMPLETE
```

必須同時滿足：

```text
[ ] Gate 1 PASS
[ ] Gate 2 PASS
[ ] Gate 3 PASS
[ ] Gate 4 PASS
[ ] Gate 5 PASS
[ ] Real CWA Data used
[ ] Automated tests pass
[ ] No secret exposed
[ ] GitHub repository verified
[ ] Production deployment verified
```

---

# 9. Current Baseline

```text
TAG: 2026.09.24-current
STATUS: CURRENT

MAINLINE:

CWA API
   ↓
Database
   ↓
Local Taiwan GIS
   ↓
GitHub
   ↓
Vercel
```

此文件在使用者確認以前：

```text
DO NOT IMPLEMENT FUTURE GATES
DO NOT START NEXT GATE WITHOUT PASS
```