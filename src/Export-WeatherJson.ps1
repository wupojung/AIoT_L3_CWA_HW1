param (
    [string]$DatabasePath,
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

Import-Module (Join-Path $PSScriptRoot "SQLiteHelper.psm1") -Force

if ([string]::IsNullOrWhiteSpace($DatabasePath)) {
    $DatabasePath = Join-Path $PSScriptRoot "..\data\weather.db"
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $PSScriptRoot "..\web\public\weather.json"
}

if (-not (Test-Path $DatabasePath)) {
    throw "Database not found at $DatabasePath"
}

$query = "SELECT * FROM weather_observations ORDER BY StationId"
$stations = @(Invoke-SqliteSelect -DatabasePath $DatabasePath -Query $query)

$outputDir = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrWhiteSpace($outputDir) -and -not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Use -InputObject so zero or one station still produces a valid JSON array.
$json = ConvertTo-Json -InputObject $stations -Depth 3 -Compress
[System.IO.File]::WriteAllText(
    $OutputPath,
    $json,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host "Exported $($stations.Count) stations to $OutputPath"
