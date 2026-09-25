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
    
    $countyCode = if ($station.CountyCode) { "'" + ([string]$station.CountyCode).Replace("'", "''") + "'" } else { "NULL" }
    $townCode = if ($station.TownCode) { "'" + ([string]$station.TownCode).Replace("'", "''") + "'" } else { "NULL" }
    $stationAltitude = if ($null -ne $station.StationAltitude -and "$($station.StationAltitude)" -ne "") { [string]$station.StationAltitude } else { "NULL" }

    $lat = if ($null -ne $station.Latitude -and "$($station.Latitude)" -ne "") { [string]$station.Latitude } else { "NULL" }
    $lon = if ($null -ne $station.Longitude -and "$($station.Longitude)" -ne "") { [string]$station.Longitude } else { "NULL" }

    $obsTime = if ($station.ObsTime) { "'" + ([string]$station.ObsTime).Replace("'", "''") + "'" } else { "NULL" }
    $weather = if ($station.Weather) { "'" + ([string]$station.Weather).Replace("'", "''") + "'" } else { "NULL" }
    $visDesc = if ($station.VisibilityDescription) { "'" + ([string]$station.VisibilityDescription).Replace("'", "''") + "'" } else { "NULL" }
    
    $sunshine = if ($null -ne $station.SunshineDuration -and "$($station.SunshineDuration)" -ne "") { [string]$station.SunshineDuration } else { "NULL" }
    $precip = if ($null -ne $station.Precipitation -and "$($station.Precipitation)" -ne "") { [string]$station.Precipitation } else { "NULL" }
    $windDir = if ($null -ne $station.WindDirection -and "$($station.WindDirection)" -ne "") { [string]$station.WindDirection } else { "NULL" }
    $windSpd = if ($null -ne $station.WindSpeed -and "$($station.WindSpeed)" -ne "") { [string]$station.WindSpeed } else { "NULL" }
    $temp = if ($null -ne $station.Temperature -and "$($station.Temperature)" -ne "") { [string]$station.Temperature } else { "NULL" }
    $humidity = if ($null -ne $station.Humidity -and "$($station.Humidity)" -ne "") { [string]$station.Humidity } else { "NULL" }
    $pressure = if ($null -ne $station.AirPressure -and "$($station.AirPressure)" -ne "") { [string]$station.AirPressure } else { "NULL" }
    $uv = if ($station.UVIndex) { "'" + ([string]$station.UVIndex).Replace("'", "''") + "'" } else { "NULL" }
    
    $m10Spd = if ($null -ne $station.Max10MinAverage_WindSpeed -and "$($station.Max10MinAverage_WindSpeed)" -ne "") { [string]$station.Max10MinAverage_WindSpeed } else { "NULL" }
    $m10Dir = if ($null -ne $station.Max10MinAverage_WindDirection -and "$($station.Max10MinAverage_WindDirection)" -ne "") { [string]$station.Max10MinAverage_WindDirection } else { "NULL" }
    $m10Time = if ($station.Max10MinAverage_DateTime) { "'" + ([string]$station.Max10MinAverage_DateTime).Replace("'", "''") + "'" } else { "NULL" }

    $gSpd = if ($null -ne $station.GustInfo_PeakGustSpeed -and "$($station.GustInfo_PeakGustSpeed)" -ne "") { [string]$station.GustInfo_PeakGustSpeed } else { "NULL" }
    $gDir = if ($null -ne $station.GustInfo_WindDirection -and "$($station.GustInfo_WindDirection)" -ne "") { [string]$station.GustInfo_WindDirection } else { "NULL" }
    $gTime = if ($station.GustInfo_DateTime) { "'" + ([string]$station.GustInfo_DateTime).Replace("'", "''") + "'" } else { "NULL" }

    $dhTemp = if ($null -ne $station.DailyHigh_AirTemperature -and "$($station.DailyHigh_AirTemperature)" -ne "") { [string]$station.DailyHigh_AirTemperature } else { "NULL" }
    $dhTime = if ($station.DailyHigh_DateTime) { "'" + ([string]$station.DailyHigh_DateTime).Replace("'", "''") + "'" } else { "NULL" }

    $dlTemp = if ($null -ne $station.DailyLow_AirTemperature -and "$($station.DailyLow_AirTemperature)" -ne "") { [string]$station.DailyLow_AirTemperature } else { "NULL" }
    $dlTime = if ($station.DailyLow_DateTime) { "'" + ([string]$station.DailyLow_DateTime).Replace("'", "''") + "'" } else { "NULL" }

    $cols = "StationId, StationName, County, Township, CountyCode, TownCode, StationAltitude, Latitude, Longitude, ObsTime, Weather, VisibilityDescription, SunshineDuration, Precipitation, WindDirection, WindSpeed, Temperature, Humidity, AirPressure, UVIndex, Max10MinAverage_WindSpeed, Max10MinAverage_WindDirection, Max10MinAverage_DateTime, GustInfo_PeakGustSpeed, GustInfo_WindDirection, GustInfo_DateTime, DailyHigh_AirTemperature, DailyHigh_DateTime, DailyLow_AirTemperature, DailyLow_DateTime"
    $vals = "'$id', $name, $county, $town, $countyCode, $townCode, $stationAltitude, $lat, $lon, $obsTime, $weather, $visDesc, $sunshine, $precip, $windDir, $windSpd, $temp, $humidity, $pressure, $uv, $m10Spd, $m10Dir, $m10Time, $gSpd, $gDir, $gTime, $dhTemp, $dhTime, $dlTemp, $dlTime"
    
    $sql = "INSERT INTO weather_observations ($cols) VALUES ($vals) ON CONFLICT(StationId) DO UPDATE SET " +
           "StationName=excluded.StationName, County=excluded.County, Township=excluded.Township, CountyCode=excluded.CountyCode, TownCode=excluded.TownCode, StationAltitude=excluded.StationAltitude, Latitude=excluded.Latitude, Longitude=excluded.Longitude, " +
           "ObsTime=excluded.ObsTime, Weather=excluded.Weather, VisibilityDescription=excluded.VisibilityDescription, SunshineDuration=excluded.SunshineDuration, Precipitation=excluded.Precipitation, WindDirection=excluded.WindDirection, WindSpeed=excluded.WindSpeed, Temperature=excluded.Temperature, Humidity=excluded.Humidity, AirPressure=excluded.AirPressure, UVIndex=excluded.UVIndex, " +
           "Max10MinAverage_WindSpeed=excluded.Max10MinAverage_WindSpeed, Max10MinAverage_WindDirection=excluded.Max10MinAverage_WindDirection, Max10MinAverage_DateTime=excluded.Max10MinAverage_DateTime, " +
           "GustInfo_PeakGustSpeed=excluded.GustInfo_PeakGustSpeed, GustInfo_WindDirection=excluded.GustInfo_WindDirection, GustInfo_DateTime=excluded.GustInfo_DateTime, " +
           "DailyHigh_AirTemperature=excluded.DailyHigh_AirTemperature, DailyHigh_DateTime=excluded.DailyHigh_DateTime, DailyLow_AirTemperature=excluded.DailyLow_AirTemperature, DailyLow_DateTime=excluded.DailyLow_DateTime, UpdatedAt=CURRENT_TIMESTAMP;" +
           [Environment]::NewLine

    $transactionSql += $sql
}

$transactionSql += "COMMIT;"

Invoke-SqliteQuery -DatabasePath $dbPath -Query $transactionSql

Write-Host "ETL process completed successfully."
