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
        $response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop
        return $response
    }
    catch {
        # Avoid leaking the API key if an HTTP exception includes the request URI.
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

    foreach ($station in $stationsRoot) {
        $stationName = $station.StationName
        $stationId = $station.StationId
        $obsTime = $station.ObsTime.DateTime

        $countyName = $station.GeoInfo.CountyName
        $townName = $station.GeoInfo.TownName

        $lat = $null
        $lon = $null
        $wgs84 = $station.GeoInfo.Coordinates | Where-Object { $_.CoordinateName -eq "WGS84" }
        if ($wgs84) {
            $lat = $wgs84.StationLatitude
            $lon = $wgs84.StationLongitude
        }

        $weather = $station.WeatherElement.Weather
        $temp = $station.WeatherElement.AirTemperature
        $humidity = $station.WeatherElement.RelativeHumidity

        $parsedStations += [PSCustomObject]@{
            StationId = $stationId
            StationName = $stationName
            County = $countyName
            Township = $townName
            Latitude = $lat
            Longitude = $lon
            ObsTime = $obsTime
            Weather = $weather
            Temperature = $temp
            Humidity = $humidity
        }
    }

    return $parsedStations
}

Export-ModuleMember -Function Invoke-CwaRequest, ConvertFrom-CwaResponse
