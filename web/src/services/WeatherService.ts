import { WeatherObservation } from '../domain/WeatherObservation';

export class WeatherService {
    constructor(private dataUrl: string = '/weather.json') {}

    async getObservations(): Promise<WeatherObservation[]> {
        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            return data as WeatherObservation[];
        } catch (err) {
            console.error('Failed to fetch weather data:', err);
            throw err;
        }
    }
}
