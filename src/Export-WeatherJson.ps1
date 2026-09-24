$ErrorActionPreference = 'Stop'

# 1. Import Modules
Import-Module (Join-Path $PSScriptRoot "SQLiteHelper.psm1") -Force

# 2. Database paths
$dbDir = Join-Path $PSScriptRoot "..\data"
$dbPath = Join-Path $dbDir "weather.db"

if (-not (Test-Path $dbPath)) {
    throw "Database not found at $dbPath"
}

# 3. Query all stations
$query = "SELECT * FROM weather_observations"
$stations = Invoke-SqliteSelect -DatabasePath $dbPath -Query $query

# 4. Write to JSON
$webDir = Join-Path $PSScriptRoot "..\web\public"
if (-not (Test-Path $webDir)) {
    New-Item -ItemType Directory -Path $webDir -Force | Out-Null
}

$outPath = Join-Path $webDir "weather.json"

# Convert to JSON. Depth 2 is enough for flat objects.
$json = $stations | ConvertTo-Json -Depth 2 -Compress

# Save as UTF8 (without BOM is ideal for web, but PS5.1 out-file utf8 adds BOM, which is acceptable).
[System.IO.File]::WriteAllText($outPath, $json, [System.Text.Encoding]::UTF8)

Write-Host "Exported $($stations.Count) stations to $outPath"
