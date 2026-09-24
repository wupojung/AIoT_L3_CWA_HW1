$ErrorActionPreference = 'Stop'


# 1. Load Environment variables
$envPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envPath) {
    Get-Content $envPath -Encoding UTF8 | Where-Object { $_ -match "^[^#].*=" } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        $cleanName = $name.Trim([char]0xFEFF).Trim()
        [System.Environment]::SetEnvironmentVariable($cleanName, $value.Trim())
    }
}

$apiKey = [System.Environment]::GetEnvironmentVariable('CWA_API_KEY')
if (-not $apiKey) {
    throw "CWA_API_KEY is not set."
}
Write-Host "API Key Length in Run-Etl:" $apiKey.Length

# 2. Import Modules
Import-Module (Join-Path $PSScriptRoot "CwaClient.psm1") -Force
Import-Module (Join-Path $PSScriptRoot "SQLiteHelper.psm1") -Force

# 3. Fetch & Parse Data
Write-Host "Fetching CWA data..."
$response = Invoke-CwaRequest -DatasetId "O-A0003-001" -ApiKey $apiKey
$stations = @(ConvertFrom-CwaResponse -CwaResponse $response)
Write-Host "Parsed $($stations.Count) stations."

# 4. Initialize Database
$dbDir = Join-Path $PSScriptRoot "..\data"
if (-not (Test-Path $dbDir)) {
    New-Item -ItemType Directory -Path $dbDir | Out-Null
}
$dbPath = Join-Path $dbDir "weather.db"
$schemaPath = Join-Path $PSScriptRoot "schema.sql"

$schemaSql = Get-Content $schemaPath -Raw -Encoding UTF8
Invoke-SqliteQuery -DatabasePath $dbPath -Query $schemaSql

# 5. Insert Data
Write-Host "Loading data into SQLite..."
$transactionSql = "BEGIN TRANSACTION;`n"

foreach ($station in $stations) {
    $id = $station.StationId.Replace("'", "''")
    $name = if ($station.StationName) { "'" + $station.StationName.Replace("'", "''") + "'" } else { "NULL" }
    $county = if ($station.County) { "'" + $station.County.Replace("'", "''") + "'" } else { "NULL" }
    $town = if ($station.Township) { "'" + $station.Township.Replace("'", "''") + "'" } else { "NULL" }
    
    $lat = if ($station.Latitude) { $station.Latitude } else { "NULL" }
    $lon = if ($station.Longitude) { $station.Longitude } else { "NULL" }
    
    $obsTime = if ($station.ObsTime) { "'" + $station.ObsTime.Replace("'", "''") + "'" } else { "NULL" }
    $weather = if ($station.Weather) { "'" + $station.Weather.Replace("'", "''") + "'" } else { "NULL" }
    
    # -99.0 or -99 is used for missing sensor data
    $temp = if ($station.Temperature -and $station.Temperature -ne "-99.0" -and $station.Temperature -ne "-99") { $station.Temperature } else { "NULL" }
    $humidity = if ($station.Humidity -and $station.Humidity -ne "-99") { $station.Humidity } else { "NULL" }

    $sql = "INSERT INTO weather_observations (StationId, StationName, County, Township, Latitude, Longitude, ObsTime, Weather, Temperature, Humidity) " +
           "VALUES ('$id', $name, $county, $town, $lat, $lon, $obsTime, $weather, $temp, $humidity) " +
           "ON CONFLICT(StationId) DO UPDATE SET " +
           "StationName=excluded.StationName, County=excluded.County, Township=excluded.Township, Latitude=excluded.Latitude, Longitude=excluded.Longitude, " +
           "ObsTime=excluded.ObsTime, Weather=excluded.Weather, Temperature=excluded.Temperature, Humidity=excluded.Humidity, UpdatedAt=CURRENT_TIMESTAMP;`n"
    
    $transactionSql += $sql
}

$transactionSql += "COMMIT;"

Invoke-SqliteQuery -DatabasePath $dbPath -Query $transactionSql

Write-Host "ETL process completed successfully!"
