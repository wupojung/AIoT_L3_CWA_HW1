Import-Module "$PSScriptRoot\..\src\CwaClient.psm1" -Force

Describe "CwaClient Parser Tests" {
    It "Parses valid response correctly" {
        $jsonStr = Get-Content "$PSScriptRoot\fixtures\valid_response.json" -Raw -Encoding UTF8
        $mockResp = ConvertFrom-Json $jsonStr
        $result = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)

        $result.Count | Should-Be 2
        
        # Check normal station
        $s1 = $result[0]
        $s1.StationId | Should-Be "466940"
        $s1.CountyCode | Should-Be "10017"
        $s1.Latitude | Should-Be "25.133314"
        $s1.VisibilityDescription | Should-Be ">30"
        $s1.Temperature | Should-Be "27.6"
        $s1.Max10MinAverage_WindSpeed | Should-Be "5.6"
        $s1.DailyHigh_AirTemperature | Should-Be "28.0"

        # Check sentinel station (-99 handled as null)
        $s2 = $result[1]
        $s2.Latitude | Should-Be $null
        $s2.Temperature | Should-Be $null
        $s2.Precipitation | Should-Be $null
        $s2.Max10MinAverage_WindSpeed | Should-Be $null
        $s2.DailyHigh_AirTemperature | Should-Be $null
    }

    It "Throws when success is false" {
        $mockResp = [PSCustomObject]@{ success = "false" }
        { ConvertFrom-CwaResponse -CwaResponse $mockResp } |
            Should-Throw -ExceptionMessage "*Invalid or unsuccessful response*"
    }

    It "Handles missing Station array gracefully" {
        $mockResp = [PSCustomObject]@{
            success = "true"
            records = [PSCustomObject]@{
                Station = $null
            }
        }

        $result = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)
        $result.Count | Should-Be 0
    }
}

Describe "CwaClient API HTTP Tests" {
    It "Throws when API key is missing" {
        { Invoke-CwaRequest -DatasetId "O-A0003-001" -ApiKey "" } |
            Should-Throw -ExceptionMessage "*API Key is required*"
    }

    It "Handles HTTP failure" {
        Mock Invoke-RestMethod { throw "401 Unauthorized" } -ModuleName CwaClient

        { Invoke-CwaRequest -DatasetId "O-A0003-001" -ApiKey "mock_key" } |
            Should-Throw -ExceptionMessage "*Failed to fetch CWA API: 401 Unauthorized*"
    }

    It "Handles Successful response" {
        Mock Invoke-RestMethod { return [PSCustomObject]@{ success = "true" } } -ModuleName CwaClient

        $resp = Invoke-CwaRequest -DatasetId "O-A0003-001" -ApiKey "mock_key"
        $resp.success | Should-Be "true"
    }
}
