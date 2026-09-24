Import-Module "$PSScriptRoot\..\src\SQLiteHelper.psm1" -Force

Describe "Export-WeatherJson Tests" {
    BeforeAll {
        if (Test-Path "$PSScriptRoot\..\web\public\weather.json") {
            Remove-Item "$PSScriptRoot\..\web\public\weather.json" -Force
        }
    }

    It "Exports existing weather.db to weather.json" {
        & "$PSScriptRoot\..\src\Export-WeatherJson.ps1" | Out-Null
        
        (Test-Path "$PSScriptRoot\..\web\public\weather.json") | Should Be $true
        
        $json = Get-Content "$PSScriptRoot\..\web\public\weather.json" -Raw -Encoding UTF8 | ConvertFrom-Json
        $json.Count -gt 0 | Should Be $true
        
        $first = $json[0]
        $first.StationId | Should Not BeNullOrEmpty
        $first.Latitude | Should Not BeNullOrEmpty
        $first.Longitude | Should Not BeNullOrEmpty
    }

    It "Generates valid JSON" {
        $isValid = $true
        try {
            $content = Get-Content "$PSScriptRoot\..\web\public\weather.json" -Raw -Encoding UTF8
            $parsed = $content | ConvertFrom-Json -ErrorAction Stop
        } catch {
            $isValid = $false
        }
        $isValid | Should Be $true
    }
}
