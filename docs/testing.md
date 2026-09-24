# Testing Strategy

## 1. Testing Goals

Testing 是 Five-Gate Workflow 的跨 Gate 品質要求，不是額外的 Gate。

主要目標：

- 讓 Parser、Transformer、ETL、Domain Logic、Repository 可獨立驗證。
- 讓 Bug Fix 有可重複的 regression evidence。
- 讓 Gate PASS 建立在實際測試與驗證，而不是 Agent 的主觀判斷。
- 讓 GitHub Actions 從專案早期開始自動執行 deterministic checks。

## 2. Testing Principles

1. Business logic must be independently testable.
2. Parser / Transformer 優先使用 Unit Tests。
3. External CWA API request 屬於 Integration Test。
4. Database Test 使用 isolated temporary SQLite database。
5. Production weather data 必須來自真實 CWA。
6. Test fixture 可以由 sanitized real response 派生。
7. Bug Fix 應優先新增可以 reproduce bug 的 regression test。
8. UI testing 保持 pragmatic，不追求不必要的高 coverage。
9. GitHub Actions 必須執行可重複的 Automated Tests。
10. PASS 必須有 Verification Evidence。
11. Local 與 CI 必須執行同一套 tests，避免 test drift。
12. CI 不等待 Gate 4 才開始；只要有 automated tests 就應納入 CI。

## 3. PowerShell / Pester Standard

目前 Gate 1–2 的主要實作語言為 PowerShell，Automated Tests 統一使用 **Pester 6.2.0**。

### Version Policy

Local Development 與 GitHub Actions 使用相同版本：

~~~text
Pester 6.2.0
~~~

CI 必須明確安裝 / pin 此版本，不依賴 Runner 預載版本。

### Assertion Syntax

新的或修改過的 Tests 統一採用 Pester 6 推薦的 `Should-*` assertions：

~~~powershell
$result.Count | Should-Be 1
$result[0].StationName | Should-Be "基隆"
$true | Should-BeTrue
{ Invoke-Something } | Should-Throw
~~~

不得再新增舊式：

~~~powershell
$result.Count | Should Be 1
~~~

Pester 5 classic syntax（例如 `Should -Be`）在 Pester 6 仍可執行，但本專案新程式碼統一採 `Should-*` 形式，避免不同世代語法混用。

### No-Exception Test Rule

Pester 6 沒有 `Should-NotThrow` assertion。

若測試目的是確認某段程式「不應丟出例外」，直接在 `It` block 中執行該命令即可；任何 unexpected exception 都會自動讓該 test FAIL。

~~~powershell
It "Completes without exception" {
    Invoke-Something
}
~~~

不得使用不存在的：

~~~powershell
{ Invoke-Something } | Should-NotThrow
~~~

若維護舊版測試，可使用 classic syntax `Should -Not -Throw`，但新測試優先採直接執行方式。

### Test File Convention

PowerShell Tests 放置於：

~~~text
tests/
~~~

測試檔使用：

~~~text
*.Tests.ps1
~~~

例如：

~~~text
tests/
├── CwaClient.Tests.ps1
├── SQLiteHelper.Tests.ps1
└── fixtures/
~~~

Test logic 不應直接寫入 GitHub Actions workflow。Workflow 只負責準備環境並執行 repository 內既有 tests。

### Local Test Command

Push 前應先執行：

~~~powershell
Invoke-Pester -Path ./tests -Output Detailed
~~~

CI 使用：

~~~powershell
Invoke-Pester -Path ./tests -CI -Output Detailed
~~~

`-CI` 必須在 tests failed 時讓 CI Job 回傳失敗。

## 4. Test Levels

### Unit Tests

適用於 deterministic、無外部 I/O 的邏輯。

重點：Parser、Transformer、Domain Logic、Location Mapping、format/filter logic。

### Integration Tests

適用於 component boundary 或 external dependency。

例：

- 真實 CWA API request。
- ETL + temporary SQLite。
- Repository + SQLite。

### Basic UI / Manual Verification

確認：

- Taiwan map rendering。
- region selection。
- weather display。
- loading / empty / error behavior。

不追求第三方 GIS library internal coverage。

### Deployment Smoke Tests

Gate 5 驗證 Production URL 的最小關鍵路徑。

## 5. Component Testing Strategy

| Component | Primary Test | Notes |
| --- | --- | --- |
| API Client | Unit + Integration | Unit mock HTTP；real CWA 為 Integration |
| Parser | Unit | Fixture 來自 sanitized real response |
| Transformer | Unit | 盡量 pure / deterministic |
| Domain Logic | Unit | 不依賴 UI / DB |
| Repository | Integration | Temporary SQLite |
| ETL | Integration | Fixture → transform → temp DB → verify |
| Location Mapping | Unit | GIS 正確性的重要邏輯 |
| GIS UI | Basic integration/manual | 不測 library internals |
| Deployment | Smoke | Production critical path |

## 6. API Client Testing

Unit Test 可涵蓋：

- successful response handling
- HTTP error
- authentication failure
- timeout
- invalid/empty response behavior

真實 CWA API 驗證不可由 fake data 取代。

## 7. Parser Testing

Parser 是本專案最重要的 Unit Test target 之一。

至少考慮：

- valid observed response
- missing field
- null/empty field
- unexpected structure
- empty collection

在 Gate 1 取得真實 response 前，不先建立假的 CWA schema test。

## 8. Transformer / Domain Testing

Transformer 應以明確 Input → Expected Output 驗證。

測試應避免：

- network
- real filesystem dependency
- UI dependency

讓 transformation rule 可以快速、穩定地執行。

## 9. Database / Repository Testing

Repository tests 使用 isolated temporary SQLite。

至少驗證：

- insert
- query
- update / refresh behavior
- duplicate strategy
- transaction/error behavior（若實作需要）

測試不得寫入開發者正式 local database。

目前 `SQLiteHelper.psm1` 使用 Windows `winsqlite3.dll`，因此 PowerShell / SQLite CI tests 暫時使用 `windows-latest` runner。未來若 SQLite abstraction 改為 cross-platform implementation，再重新評估 runner。

## 10. ETL Testing

建議測試邊界：

~~~text
Sanitized Fixture
      ↓
Parser / Transformer
      ↓
ETL
      ↓
Temporary SQLite
      ↓
Expected Query Result
~~~

另外保留真實 CWA → ETL → SQLite 的 Integration Verification。

## 11. Test Data Strategy

- Production：真實 CWA data。
- Unit Tests：sanitized fixtures / mocks。
- Fixture 必須來自實際觀察過的 response structure。
- API Key、個人 secret 或不必要敏感內容不得進 fixture。

Mock 的用途是隔離測試，不是取代正式 CWA Integration。

## 12. Bug Fix Rule

遇到可重現 Bug 時，優先流程：

~~~text
Reproduce
↓
Add / Update Test
↓
Confirm Test Fails
↓
Fix
↓
Confirm Test Passes
↓
Run Regression Tests
~~~

如果 Bug 不適合 automated test，至少留下明確 manual verification procedure。

## 13. Continuous Integration Policy

CI 從專案早期開始，不等待 Gate 4。

~~~text
Gate 1 Tests
      ↓
      CI
      ↓
Gate 2 Tests
      ↓
      CI
      ↓
Gate 3 Tests
      ↓
      CI
~~~

Gate 4 的角色是 **CI Hardening / Final Repository Verification**，不是第一次建立 CI。

目前 Gate 2 階段最低 CI Scope：

~~~text
Repository Baseline Checks
+
CwaClient Pester Tests
+
SQLiteHelper Pester Tests
~~~

之後依實際技術棧逐步加入：

- ETL tests
- Application logic tests
- Lint
- Build
- GIS / Web tests

### Real CWA API and CI

每次 Push 的 deterministic CI 不直接依賴真實 CWA API，以避免 network outage、rate limit、API availability 或 Secret dependency 造成不穩定。

日常 CI 使用 sanitized fixtures / mocks。

真實 CWA API Request 屬於 Integration Verification，可由 Gate Verification、Manual Run 或後續 Dedicated / Scheduled Workflow 執行。

## 14. CI PASS Rule

~~~text
Source Code
    ↓
Local Pester
    ↓
Commit / Push
    ↓
GitHub Actions
    ↓
Pester CI
    ↓
PASS / FAIL
~~~

Automated Test FAIL 時：

~~~text
CI = FAIL
~~~

不得透過刪除 failing test、降低 assertion、skip required test 或只修改 README 狀態取得假性綠燈。

## 15. Gate Verification Evidence

Gate PASS 的 evidence 可以包含：

- Test command + actual result。
- GitHub Actions run。
- SQL/query result。
- Manual verification checklist。
- Deployment smoke test result。

以下不算 evidence：

- "should pass"
- "looks correct"
- "implementation complete"

## 16. What We Will Not Test

目前不主動測試：

- Third-party library internals
- Leaflet / GIS library implementation internals
- Browser rendering engine
- Framework internal behavior
- 100% UI coverage

測試資源優先放在本專案自己的邏輯與風險上。
