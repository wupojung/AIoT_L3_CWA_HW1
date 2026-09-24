Import-Module "$PSScriptRoot\..\src\SQLiteHelper.psm1" -Force

Describe "Export-WeatherJson Tests" {
    BeforeAll {
        $testDb = Join-Path $PSScriptRoot "test_export.sqlite"
        $testOutput = Join-Path $PSScriptRoot "test_weather.json"
        $schemaPath = Join-Path $PSScriptRoot "..\src\schema.sql"

        foreach ($path in @($testDb, $testOutput)) {
            if (Test-Path $path) {
                Remove-Item $path -Force
            }
        }

        $schemaSql = Get-Content $schemaPath -Raw -Encoding UTF8
        Invoke-SqliteQuery -DatabasePath $testDb -Query $schemaSql

        $seedSql = @"
INSERT INTO weather_observations
(StationId, StationName, County, Township, Latitude, Longitude, ObsTime, Weather, Temperature, Humidity)
VALUES
('TEST001', '臺北測站', '臺北市', '中正區', 25.0330, 121.5654, '2026-09-25T01:00:00+08:00', '晴', 28.5, 0.72),
('TEST002', '臺中測站', '臺中市', '南屯區', 24.1477, 120.6736, '2026-09-25T01:00:00+08:00', '多雲', 27.0, 0.75);
"@
        Invoke-SqliteQuery -DatabasePath $testDb -Query $seedSql

        & "$PSScriptRoot\..\src\Export-WeatherJson.ps1" -DatabasePath $testDb -OutputPath $testOutput | Out-Null
    }

    It "Exports temporary SQLite data to JSON" {
        (Test-Path $testOutput) | Should-BeTrue

        $json = Get-Content $testOutput -Raw -Encoding UTF8 | ConvertFrom-Json

        $json.Count | Should-Be 2
        $json[0].StationId | Should-Be "TEST001"
        $json[0].StationName | Should-Be "臺北測站"
        $json[0].Latitude | Should-Be "25.033"
        $json[0].Longitude | Should-Be "121.5654"
    }

    It "Generates valid JSON with unique station IDs" {
        $content = Get-Content $testOutput -Raw -Encoding UTF8
        $json = $content | ConvertFrom-Json -ErrorAction Stop

        $json.Count | Should-Be 2
        @($json.StationId | Select-Object -Unique).Count | Should-Be $json.Count
    }

    It "Throws when the requested database does not exist" {
        $missingDb = Join-Path $PSScriptRoot "missing_weather.sqlite"
        $unusedOutput = Join-Path $PSScriptRoot "unused_weather.json"

        {
            & "$PSScriptRoot\..\src\Export-WeatherJson.ps1" -DatabasePath $missingDb -OutputPath $unusedOutput
        } | Should-Throw -ExceptionMessage "*Database not found*"
    }

    AfterAll {
        foreach ($path in @($testDb, $testOutput, $unusedOutput)) {
            if ($path -and (Test-Path $path)) {
                Remove-Item $path -Force
            }
        }
    }
}
