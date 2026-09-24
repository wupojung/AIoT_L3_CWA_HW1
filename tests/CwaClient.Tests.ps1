Import-Module "$PSScriptRoot\..\src\CwaClient.psm1" -Force

Describe "CwaClient Parser Tests" {
    It "Parses valid response correctly" {
        $jsonStr = Get-Content "$PSScriptRoot\fixtures\valid_response.json" -Raw -Encoding UTF8
        $mockResp = ConvertFrom-Json $jsonStr
        $result = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)
        
        $result.Count | Should Be 1
        $result[0].StationName | Should Be "基隆"
        $result[0].StationId | Should Be "466940"
        $result[0].County | Should Be "基隆市"
        $result[0].Township | Should Be "信義區"
        $result[0].Temperature | Should Be "25.5"
    }

    It "Throws when success is false" {
        $mockResp = [PSCustomObject]@{ success = "false" }
        { ConvertFrom-CwaResponse -CwaResponse $mockResp } | Should Throw "Invalid or unsuccessful response"
    }

    It "Handles missing Station array gracefully" {
        $mockResp = [PSCustomObject]@{
            success = "true"
            records = [PSCustomObject]@{
                Station = $null
            }
        }
        $result = @(ConvertFrom-CwaResponse -CwaResponse $mockResp)
        $result.Count | Should Be 0
    }
}

Describe "CwaClient API HTTP Tests" {
    It "Throws when API key is missing" {
        { Invoke-CwaRequest -DatasetId "O-A0003-001" -ApiKey "" } | Should Throw "API Key is required"
    }

    It "Handles HTTP failure" {
        Mock Invoke-RestMethod { throw "401 Unauthorized" } -ModuleName CwaClient
        { Invoke-CwaRequest -DatasetId "O-A0003-001" -ApiKey "mock_key" } | Should Throw "Failed to fetch CWA API: 401 Unauthorized"
    }
    
    It "Handles Successful response" {
        Mock Invoke-RestMethod { return [PSCustomObject]@{ success = "true" } } -ModuleName CwaClient
        $resp = Invoke-CwaRequest -DatasetId "O-A0003-001" -ApiKey "mock_key"
        $resp.success | Should Be "true"
    }
}
