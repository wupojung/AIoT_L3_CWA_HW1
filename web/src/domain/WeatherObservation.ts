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
}
