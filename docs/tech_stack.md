# Technology Stack Decision

## Gate 1 Runtime & Testing Tools

For Gate 1 (CWA API Client & Parser), we require an environment that supports HTTP requests, JSON parsing, and an automated testing framework. 

During environment inspection, we observed that neither Node.js, Python, nor the .NET SDK are currently installed or available in the system PATH. 

Following the principle of "select the minimum practical combination required" and avoiding unnecessary tool installations, we have chosen:
- **Runtime:** Windows PowerShell 5.1 (Built-in)
- **Testing Framework:** Pester 3.4.0 (Built-in PowerShell testing module)

### Why PowerShell?
- Native to the current Windows environment.
- Provides `Invoke-RestMethod` for HTTP operations and JSON conversion natively.
- Supports module encapsulation (`.psm1`).
- Pester allows comprehensive unit testing and HTTP client mocking.
- Does not prematurely dictate the Gate 3 Web Architecture, as ETL scripts can run independently.

This meets all Gate 1 requirements while maintaining a minimal and isolated footprint.
