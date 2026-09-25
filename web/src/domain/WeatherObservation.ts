export interface WeatherObservation {
    StationId: string;
    StationName: string;
    County: string;
    Township: string;
    Latitude: string | number;
    Longitude: string | number;
    ObsTime: string;
    Weather: string | null;
    Temperature: string | number | null;
    Humidity: string | number | null;

    // v1.1.0 new fields
    CountyCode?: string | null;
    TownCode?: string | null;
    StationAltitude?: string | number | null;
    VisibilityDescription?: string | null;
    SunshineDuration?: string | number | null;
    Precipitation?: string | number | null;
    WindDirection?: string | number | null;
    WindSpeed?: string | number | null;
    AirPressure?: string | number | null;
    UVIndex?: string | number | null;
    Max10MinAverage_WindSpeed?: string | number | null;
    Max10MinAverage_WindDirection?: string | number | null;
    Max10MinAverage_DateTime?: string | null;
    GustInfo_PeakGustSpeed?: string | number | null;
    GustInfo_WindDirection?: string | number | null;
    GustInfo_DateTime?: string | null;
    DailyHigh_AirTemperature?: string | number | null;
    DailyHigh_DateTime?: string | null;
    DailyLow_AirTemperature?: string | number | null;
    DailyLow_DateTime?: string | null;
}
