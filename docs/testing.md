# Testing Strategy

## 1. Testing Goals

Testing 是 Five-Gate Workflow 的跨 Gate 品質要求，不是額外的 Gate。

主要目標：

- 讓 Parser、Transformer、ETL、Domain Logic、Repository 可獨立驗證。
- 讓 Bug Fix 有可重複的 regression evidence。
- 讓 Gate PASS 建立在實際測試與驗證，而不是 Agent 的主觀判斷。
- 讓 Gate 4 的 GitHub Actions 自動執行 deterministic checks。

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

## 3. Test Levels

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

## 4. Component Testing Strategy

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

## 5. API Client Testing

Unit Test 可涵蓋：

- successful response handling
- HTTP error
- authentication failure
- timeout
- invalid/empty response behavior

真實 CWA API 驗證不可由 fake data 取代。

## 6. Parser Testing

Parser 是本專案最重要的 Unit Test target 之一。

至少考慮：

- valid observed response
- missing field
- null/empty field
- unexpected structure
- empty collection

在 Gate 1 取得真實 response 前，不先建立假的 CWA schema test。

## 7. Transformer / Domain Testing

Transformer 應以明確 Input → Expected Output 驗證。

測試應避免：

- network
- real filesystem dependency
- UI dependency

讓 transformation rule 可以快速、穩定地執行。

## 8. Database / Repository Testing

Repository tests 使用 isolated temporary SQLite。

至少驗證：

- insert
- query
- update / refresh behavior
- duplicate strategy
- transaction/error behavior（若實作需要）

測試不得寫入開發者正式 local database。

## 9. ETL Testing

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

## 10. Test Data Strategy

- Production：真實 CWA data。
- Unit Tests：sanitized fixtures / mocks。
- Fixture 必須來自實際觀察過的 response structure。
- API Key、個人 secret 或不必要敏感內容不得進 fixture。

Mock 的用途是隔離測試，不是取代正式 CWA Integration。

## 11. Bug Fix Rule

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

## 12. CI Testing

Gate 4 的 GitHub Actions 最低必須執行：

~~~text
Install Dependencies
→ Lint
→ Automated Tests
→ Build
~~~

在技術棧尚未選定前，不猜 runtime-specific command。

Real CWA Integration Test 不建議每次 push 都執行，避免 external outage、rate limit 與 secret dependency 讓 deterministic CI 不穩定。可在 Gate verification、manual run 或後續 scheduled workflow 執行。

## 13. Gate Verification Evidence

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

## 14. What We Will Not Test

目前不主動測試：

- Third-party library internals
- Leaflet / GIS library implementation internals
- Browser rendering engine
- Framework internal behavior
- 100% UI coverage

測試資源優先放在本專案自己的邏輯與風險上。