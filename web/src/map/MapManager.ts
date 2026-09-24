import L from 'leaflet';
import { WeatherObservation } from '../domain/WeatherObservation';

export class MapManager {
    private map: L.Map | null = null;
    private markersLayer: L.LayerGroup | null = null;

    constructor(private elementId: string) {}

    init() {
        // Center on Taiwan
        this.map = L.map(this.elementId, {
            zoomControl: false // We will move zoom control to bottom right
        }).setView([23.7, 121.0], 8);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        // Sleek Dark Matter tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(this.map);

        this.markersLayer = L.layerGroup().addTo(this.map);
    }

    private getTempColor(temp: number): string {
        if (temp < 15) return '#3498db'; // Cool blue
        if (temp < 20) return '#2ecc71'; // Greenish
        if (temp < 25) return '#f1c40f'; // Yellow
        if (temp < 30) return '#e67e22'; // Orange
        return '#e74c3c'; // Hot red
    }

    renderObservations(observations: WeatherObservation[]) {
        if (!this.map || !this.markersLayer) {
            this.init();
        }

        this.markersLayer?.clearLayers();

        observations.forEach(obs => {
            const lat = Number(obs.Latitude);
            const lon = Number(obs.Longitude);

            if (isNaN(lat) || isNaN(lon)) return;

            const formatVal = (val: string | number | null) => {
                if (val === null || val === undefined || val === '-99' || val === -99 || val === '-99.0' || val === -99.0) {
                    return null;
                }
                return val;
            };

            const temp = formatVal(obs.Temperature);
            const hum = formatVal(obs.Humidity);
            
            const tempStr = temp === null ? '--' : `${temp}°`;
            const humStr = hum === null ? '--' : `${hum}%`;
            
            const numTemp = typeof temp === 'string' ? parseFloat(temp) : temp;
            const markerColor = numTemp !== null && !isNaN(numTemp) ? this.getTempColor(numTemp) : '#7f8c8d';

            const popupContent = `
                <div class="weather-popup">
                    <h3>${obs.StationName}</h3>
                    <p><strong>Region</strong> <span>${obs.County} ${obs.Township}</span></p>
                    <p><strong>Weather</strong> <span>${obs.Weather || '--'}</span></p>
                    <p><strong>Temp</strong> <span>${temp !== null ? temp + '°C' : '--'}</span></p>
                    <p><strong>Humidity</strong> <span>${humStr}</span></p>
                    <p><strong>Time</strong> <span>${obs.ObsTime ? new Date(obs.ObsTime).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'}) : '--'}</span></p>
                </div>
            `;

            // Custom HTML Marker showing temperature
            const icon = L.divIcon({
                className: 'custom-temp-icon',
                html: `<div class="temp-marker" style="background-color: ${markerColor}; width: 36px; height: 36px;">${tempStr}</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
                popupAnchor: [0, -18]
            });

            L.marker([lat, lon], { icon })
                .bindPopup(popupContent)
                .addTo(this.markersLayer!);
        });
    }
}
