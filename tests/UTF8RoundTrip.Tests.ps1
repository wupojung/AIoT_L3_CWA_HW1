Import-Module "$PSScriptRoot\..\src\CwaClient.psm1" -Force
Import-Module "$PSScriptRoot\..\src\SQLiteHelper.psm1" -Force

Describe "UTF-8 Round-Trip Regression Tests" {
    # This test suite guards against encoding regressions (mojibake).
    # It verifies that Traditional Chinese strings survive the full pipeline:
    #   CWA Fixture → Parser → SQLite INSERT → SELECT → JSON Export → Assert Exact Strings

    BeforeAll {
        $testDb  = Join-Path $PSScriptRoot "test_utf8rt.sqlite"
        $testOut = Join-Path $PSScriptRoot "test_utf8rt.json"

        foreach ($p in @($testDb, $testOut)) {
            if (Test-Path $p) { Remove-Item $p -Force }
        }

        # 1. Load schema into a fresh SQLite database
        $schemaPath = Join-Path $PSScriptRoot "..\src\schema.sql"
        $schemaSql  = Get-Content $schemaPath -Raw -Encoding UTF8
        Invoke-SqliteQuery -DatabasePath $testDb -Query $schemaSql

        # 2. Parse the Traditional Chinese fixture
        $jsonStr  = Get-Content "$PSScriptRoot\fixtures\utf8_fixture.json" -Raw -Encoding UTF8
        $mockResp = ConvertFrom-Json $jsonStr
        $stations = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)

        # 3. Build UPSERT SQL and insert into SQLite
        $station  = $stations[0]
        $name     = "'" + ([string]$station.StationName).Replace("'","''") + "'"
        $county   = "'" + ([string]$station.County).Replace("'","''") + "'"
        $town     = "'" + ([string]$station.Township).Replace("'","''") + "'"
        $weather  = "'" + ([string]$station.Weather).Replace("'","''") + "'"
        $lat      = [string]$station.Latitude
        $lon      = [string]$station.Longitude
        $obsTime  = "'" + ([string]$station.ObsTime).Replace("'","''") + "'"

        $insertSql = @"
INSERT INTO weather_observations
  (StationId, StationName, County, Township, Latitude, Longitude, ObsTime, Weather)
VALUES
  ('467490', $name, $county, $town, $lat, $lon, $obsTime, $weather)
ON CONFLICT(StationId) DO UPDATE SET
  StationName=excluded.StationName,
  County=excluded.County,
  Township=excluded.Township,
  Weather=excluded.Weather;
"@
        Invoke-SqliteQuery -DatabasePath $testDb -Query $insertSql

        # 4. Read back from SQLite
        $Script:selectResult = @(Invoke-SqliteSelect -DatabasePath $testDb -Query "SELECT StationId, StationName, County, Township, Weather FROM weather_observations WHERE StationId='467490'")

        # 5. Export to JSON via Export-WeatherJson.ps1
        & "$PSScriptRoot\..\src\Export-WeatherJson.ps1" -DatabasePath $testDb -OutputPath $testOut | Out-Null
        $Script:jsonData = Get-Content $testOut -Raw -Encoding UTF8 | ConvertFrom-Json
    }

    It "Parser preserves Traditional Chinese StationName (臺中)" {
        $jsonStr  = Get-Content "$PSScriptRoot\fixtures\utf8_fixture.json" -Raw -Encoding UTF8
        $mockResp = ConvertFrom-Json $jsonStr
        $result   = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)
        $result[0].StationName | Should-Be "臺中"
    }

    It "Parser preserves Traditional Chinese County (臺中市)" {
        $jsonStr  = Get-Content "$PSScriptRoot\fixtures\utf8_fixture.json" -Raw -Encoding UTF8
        $mockResp = ConvertFrom-Json $jsonStr
        $result   = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)
        $result[0].County | Should-Be "臺中市"
    }

    It "Parser preserves Traditional Chinese Township (西屯區)" {
        $jsonStr  = Get-Content "$PSScriptRoot\fixtures\utf8_fixture.json" -Raw -Encoding UTF8
        $mockResp = ConvertFrom-Json $jsonStr
        $result   = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)
        $result[0].Township | Should-Be "西屯區"
    }

    It "Parser preserves Traditional Chinese Weather (多雲)" {
        $jsonStr  = Get-Content "$PSScriptRoot\fixtures\utf8_fixture.json" -Raw -Encoding UTF8
        $mockResp = ConvertFrom-Json $jsonStr
        $result   = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)
        $result[0].Weather | Should-Be "多雲"
    }

    It "SQLite SELECT returns exact Traditional Chinese StationName (臺中)" {
        $Script:selectResult[0]["StationName"] | Should-Be "臺中"
    }

    It "SQLite SELECT returns exact Traditional Chinese County (臺中市)" {
        $Script:selectResult[0]["County"] | Should-Be "臺中市"
    }

    It "SQLite SELECT returns exact Traditional Chinese Township (西屯區)" {
        $Script:selectResult[0]["Township"] | Should-Be "西屯區"
    }

    It "SQLite SELECT returns exact Traditional Chinese Weather (多雲)" {
        $Script:selectResult[0]["Weather"] | Should-Be "多雲"
    }

    It "JSON export contains exact Traditional Chinese StationName (臺中)" {
        $row = $Script:jsonData | Where-Object { $_.StationId -eq "467490" }
        $row.StationName | Should-Be "臺中"
    }

    It "JSON export contains exact Traditional Chinese County (臺中市)" {
        $row = $Script:jsonData | Where-Object { $_.StationId -eq "467490" }
        $row.County | Should-Be "臺中市"
    }

    It "JSON export contains exact Traditional Chinese Township (西屯區)" {
        $row = $Script:jsonData | Where-Object { $_.StationId -eq "467490" }
        $row.Township | Should-Be "西屯區"
    }

    It "JSON export contains exact Traditional Chinese Weather (多雲)" {
        $row = $Script:jsonData | Where-Object { $_.StationId -eq "467490" }
        $row.Weather | Should-Be "多雲"
    }

    AfterAll {
        foreach ($p in @($testDb, $testOut)) {
            if ($p -and (Test-Path $p)) { Remove-Item $p -Force }
        }
    }
}
