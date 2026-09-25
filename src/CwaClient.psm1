function Invoke-CwaRequest {
    param (
        [string]$DatasetId = "O-A0003-001",
        [string]$ApiKey
    )

    if ([string]::IsNullOrWhiteSpace($ApiKey)) {
        throw "API Key is required"
    }

    $uri = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/${DatasetId}?Authorization=${ApiKey}&format=JSON"
    Write-Host "Fetching CWA dataset '$DatasetId'..."

    try {
        $tempFile = [System.IO.Path]::GetTempFileName()
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $uri -Method Get -UseBasicParsing -OutFile $tempFile -ErrorAction Stop
        $jsonString = [System.IO.File]::ReadAllText($tempFile, [System.Text.Encoding]::UTF8)
        Remove-Item $tempFile -ErrorAction Ignore
        return ($jsonString | ConvertFrom-Json)
    }
    catch {
        # Do not expose the API key in logs even if an exception contains the request URI.
        $errorMessage = $_.Exception.Message
        if (-not [string]::IsNullOrEmpty($ApiKey)) {
            $errorMessage = $errorMessage.Replace($ApiKey, "***")
        }

        throw "Failed to fetch CWA API: $errorMessage"
    }
}

function ConvertFrom-CwaResponse {
    param (
        [Parameter(Mandatory=$true)]
        $CwaResponse
    )

    if ($null -eq $CwaResponse.success -or $CwaResponse.success -ne "true") {
        throw "Invalid or unsuccessful response"
    }

    $parsedStations = @()

    $stationsRoot = $CwaResponse.records.Station
    if ($null -eq $stationsRoot) {
        return $parsedStations
    }

    $f = {
        param($v)
        $s = [string]$v
        if ([string]::IsNullOrWhiteSpace($s)) { return $null }
        if ($s -match "^-(99|98)(\.0+)?$" -or $s -eq "990" -or $s -eq "X") { return $null }
        return $s
    }

    foreach ($station in $stationsRoot) {
        $wgs84 = $station.GeoInfo.Coordinates | Where-Object { $_.CoordinateName -eq "WGS84" }
        $we = $station.WeatherElement

        $parsedStations += [PSCustomObject]@{
            StationId = $station.StationId
            StationName = $station.StationName
            ObsTime = $station.ObsTime.DateTime
            
            Latitude = &$f ($wgs84.StationLatitude)
            Longitude = &$f ($wgs84.StationLongitude)
            StationAltitude = &$f ($station.GeoInfo.StationAltitude)
            County = &$f ($station.GeoInfo.CountyName)
            Township = &$f ($station.GeoInfo.TownName)
            CountyCode = &$f ($station.GeoInfo.CountyCode)
            TownCode = &$f ($station.GeoInfo.TownCode)

            Weather = &$f ($we.Weather)
            VisibilityDescription = &$f ($we.VisibilityDescription)
            SunshineDuration = &$f ($we.SunshineDuration)
            Precipitation = &$f ($we.Now.Precipitation)
            WindDirection = &$f ($we.WindDirection)
            WindSpeed = &$f ($we.WindSpeed)
            Temperature = &$f ($we.AirTemperature)
            Humidity = &$f ($we.RelativeHumidity)
            AirPressure = &$f ($we.AirPressure)
            UVIndex = &$f ($we.UVIndex)

            Max10MinAverage_WindSpeed = &$f ($we.Max10MinAverage.WindSpeed)
            Max10MinAverage_WindDirection = &$f ($we.Max10MinAverage.Occurred_at.WindDirection)
            Max10MinAverage_DateTime = &$f ($we.Max10MinAverage.Occurred_at.DateTime)

            GustInfo_PeakGustSpeed = &$f ($we.GustInfo.PeakGustSpeed)
            GustInfo_WindDirection = &$f ($we.GustInfo.Occurred_at.WindDirection)
            GustInfo_DateTime = &$f ($we.GustInfo.Occurred_at.DateTime)

            DailyHigh_AirTemperature = &$f ($we.DailyExtreme.DailyHigh.TemperatureInfo.AirTemperature)
            DailyHigh_DateTime = &$f ($we.DailyExtreme.DailyHigh.TemperatureInfo.Occurred_at.DateTime)
            
            DailyLow_AirTemperature = &$f ($we.DailyExtreme.DailyLow.TemperatureInfo.AirTemperature)
            DailyLow_DateTime = &$f ($we.DailyExtreme.DailyLow.TemperatureInfo.Occurred_at.DateTime)
        }
    }

    return $parsedStations
}

Export-ModuleMember -Function Invoke-CwaRequest, ConvertFrom-CwaResponse
