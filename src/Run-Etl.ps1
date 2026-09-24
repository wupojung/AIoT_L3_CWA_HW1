$ErrorActionPreference = 'Stop'

# 1. Load local environment variables when .env exists.
# In CI, CWA_API_KEY can be injected directly as a process environment variable.
$envPath = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envPath) {
    Get-Content $envPath -Encoding UTF8 |
        Where-Object { $_ -match "^[^#].*=" } |
        ForEach-Object {
            $name, $value = $_.Split('=', 2)
            $cleanName = $name.Trim([char]0xFEFF).Trim()

            if (-not [string]::IsNullOrWhiteSpace($cleanName)) {
                [System.Environment]::SetEnvironmentVariable(
                    $cleanName,
                    $value.Trim(),
                    [System.EnvironmentVariableTarget]::Process
                )
            }
        }
}

$apiKey = [System.Environment]::GetEnvironmentVariable('CWA_API_KEY')
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    throw "CWA_API_KEY is not set."
}

# 2. Import Modules
Import-Module (Join-Path $PSScriptRoot "CwaClient.psm1") -Force
Import-Module (Join-Path $PSScriptRoot "SQLiteHelper.psm1") -Force

# 3. Fetch & Parse Data
Write-Host "Fetching CWA data..."
$response = Invoke-CwaRequest -DatasetId "O-A0003-001" -ApiKey $apiKey
$stations = @(ConvertFrom-CwaResponse -CwaResponse $response)
Write-Host "Parsed $($stations.Count) stations."

if ($stations.Count -eq 0) {
    throw "CWA response contained no station records."
}

# 4. Initialize Database
$dbDir = Join-Path $PSScriptRoot "..\data"
if (-not (Test-Path $dbDir)) {
    New-Item -ItemType Directory -Path $dbDir | Out-Null
}

$dbPath = Join-Path $dbDir "weather.db"
$schemaPath = Join-Path $PSScriptRoot "schema.sql"

$schemaSql = Get-Content $schemaPath -Raw -Encoding UTF8
Invoke-SqliteQuery -DatabasePath $dbPath -Query $schemaSql

# 5. Insert / update data
Write-Host "Loading data into SQLite..."
$transactionSql = "BEGIN TRANSACTION;" + [Environment]::NewLine

foreach ($station in $stations) {
    if ([string]::IsNullOrWhiteSpace([string]$station.StationId)) {
        throw "StationId is required for ETL."
    }

    $id = ([string]$station.StationId).Replace("'", "''")
    $name = if ($station.StationName) { "'" + ([string]$station.StationName).Replace("'", "''") + "'" } else { "NULL" }
    $county = if ($station.County) { "'" + ([string]$station.County).Replace("'", "''") + "'" } else { "NULL" }
    $town = if ($station.Township) { "'" + ([string]$station.Township).Replace("'", "''") + "'" } else { "NULL" }

    $lat = if ($null -ne $station.Latitude -and "$($station.Latitude)" -ne "") { [string]$station.Latitude } else { "NULL" }
    $lon = if ($null -ne $station.Longitude -and "$($station.Longitude)" -ne "") { [string]$station.Longitude } else { "NULL" }

    $obsTime = if ($station.ObsTime) { "'" + ([string]$station.ObsTime).Replace("'", "''") + "'" } else { "NULL" }
    $weather = if ($station.Weather) { "'" + ([string]$station.Weather).Replace("'", "''") + "'" } else { "NULL" }

    # CWA uses negative sentinel values for unavailable sensor data.
    $tempText = [string]$station.Temperature
    $humidityText = [string]$station.Humidity

    $temp = if (
        -not [string]::IsNullOrWhiteSpace($tempText) -and
        $tempText -ne "-99.0" -and
        $tempText -ne "-99"
    ) { $tempText } else { "NULL" }

    $humidity = if (
        -not [string]::IsNullOrWhiteSpace($humidityText) -and
        $humidityText -ne "-99.0" -and
        $humidityText -ne "-99"
    ) { $humidityText } else { "NULL" }

    $sql = "INSERT INTO weather_observations (StationId, StationName, County, Township, Latitude, Longitude, ObsTime, Weather, Temperature, Humidity) " +
           "VALUES ('$id', $name, $county, $town, $lat, $lon, $obsTime, $weather, $temp, $humidity) " +
           "ON CONFLICT(StationId) DO UPDATE SET " +
           "StationName=excluded.StationName, County=excluded.County, Township=excluded.Township, Latitude=excluded.Latitude, Longitude=excluded.Longitude, " +
           "ObsTime=excluded.ObsTime, Weather=excluded.Weather, Temperature=excluded.Temperature, Humidity=excluded.Humidity, UpdatedAt=CURRENT_TIMESTAMP;" +
           [Environment]::NewLine

    $transactionSql += $sql
}

$transactionSql += "COMMIT;"

Invoke-SqliteQuery -DatabasePath $dbPath -Query $transactionSql

Write-Host "ETL process completed successfully."
