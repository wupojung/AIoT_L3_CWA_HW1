import L from 'leaflet';
import { WeatherObservation } from '../domain/WeatherObservation';
import {
    DataLayer,
    normalizeValue,
    getTempColor,
    getHumidityColor,
    getWeatherSymbol,
    buildPopupHtml,
} from '../domain/WeatherClassifier';

// ── Basemap tile providers ────────────────────────────────────────────────────
// VITE_CARTO_API_KEY is injected by Vite from .env at build time.
// CARTO basemaps.cartocdn.com requires an API key for dark_all / light_all tiles.
// Falls back to OpenStreetMap if the key is not configured.

function buildTileProviders() {
    const key: string = import.meta.env.VITE_CARTO_API_KEY ?? '';
    if (key) {
        return {
            dark: {
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=' + key,
                attribution:
                    '&copy; <a href="https://carto.com/attributions">CARTO</a> ' +
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
            light: {
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?api_key=' + key,
                attribution:
                    '&copy; <a href="https://carto.com/attributions">CARTO</a> ' +
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            },
        };
    }
    // Fallback: OSM standard tiles (light only, no API key required)
    const osm = {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };
    return { dark: osm, light: osm };
}

const TILE_PROVIDERS = buildTileProviders();

const MARKER_SIZE = 30;

// ── MapManager ────────────────────────────────────────────────────────────────

export class MapManager {
    private map: L.Map | null = null;
    private currentTile: L.TileLayer | null = null;

    private temperatureLayer: L.LayerGroup = L.layerGroup();
    private humidityLayer: L.LayerGroup = L.layerGroup();
    private weatherLayer: L.LayerGroup = L.layerGroup();

    private activeDataLayer: DataLayer = 'temperature';
    private observations: WeatherObservation[] = [];

    constructor(private elementId: string) {}

    init() {
        this.map = L.map(this.elementId, {
            zoomControl: false,
        }).setView([23.7, 121.0], 8);

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        this.currentTile = L.tileLayer(TILE_PROVIDERS.dark.url, {
            maxZoom: 19,
            attribution: TILE_PROVIDERS.dark.attribution,
        }).addTo(this.map);

        // Only the active data layer is added to the map initially
        this.temperatureLayer.addTo(this.map);
    }

    // ── Public control API ───────────────────────────────────────────────────

    setBasemap(type: 'dark' | 'light') {
        if (!this.map) return;
        if (this.currentTile) {
            this.map.removeLayer(this.currentTile);
        }
        this.currentTile = L.tileLayer(TILE_PROVIDERS[type].url, {
            maxZoom: 19,
            attribution: TILE_PROVIDERS[type].attribution,
        }).addTo(this.map);
        this.currentTile.bringToBack();
    }

    setDataLayer(layer: DataLayer) {
        if (!this.map) return;
        this.activeDataLayer = layer;

        // Single-active-layer model: remove all, add only the selected one
        const all = [this.temperatureLayer, this.humidityLayer, this.weatherLayer];
        all.forEach(lg => {
            if (this.map!.hasLayer(lg)) this.map!.removeLayer(lg);
        });
        this.layerGroupFor(layer).addTo(this.map);
    }

    getActiveDataLayer(): DataLayer {
        return this.activeDataLayer;
    }

    getStationCount(): number {
        return this.observations.length;
    }

    getLastUpdated(): string | null {
        const first = this.observations.find(o => !!o.ObsTime);
        return first?.ObsTime ?? null;
    }

    // ── Render ───────────────────────────────────────────────────────────────

    renderObservations(observations: WeatherObservation[]) {
        this.observations = observations;
        if (!this.map) this.init();

        this.buildTemperatureLayer(observations);
        this.buildHumidityLayer(observations);
        this.buildWeatherLayer(observations);

        // Re-apply active layer to ensure it is visible
        this.setDataLayer(this.activeDataLayer);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private layerGroupFor(layer: DataLayer): L.LayerGroup {
        switch (layer) {
            case 'temperature': return this.temperatureLayer;
            case 'humidity':    return this.humidityLayer;
            case 'weather':     return this.weatherLayer;
        }
    }

    private makeIcon(html: string): L.DivIcon {
        return L.divIcon({
            className: 'custom-marker-wrapper',
            html,
            iconSize:   [MARKER_SIZE, MARKER_SIZE],
            iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE / 2],
            popupAnchor:[0, -(MARKER_SIZE / 2)],
        });
    }

    private buildTemperatureLayer(observations: WeatherObservation[]) {
        this.temperatureLayer.clearLayers();
        observations.forEach(obs => {
            const lat = Number(obs.Latitude);
            const lon = Number(obs.Longitude);
            if (isNaN(lat) || isNaN(lon)) return;

            const temp = normalizeValue(obs.Temperature);
            const label = temp !== null ? `${temp}°` : '--';
            const color = temp !== null ? getTempColor(temp) : '#64748B';

            const icon = this.makeIcon(
                `<div class="temp-marker" style="background-color:${color}">${label}</div>`
            );
            L.marker([lat, lon], { icon })
                .bindPopup(buildPopupHtml(obs), { maxWidth: 260 })
                .addTo(this.temperatureLayer);
        });
    }

    private buildHumidityLayer(observations: WeatherObservation[]) {
        this.humidityLayer.clearLayers();
        observations.forEach(obs => {
            const lat = Number(obs.Latitude);
            const lon = Number(obs.Longitude);
            if (isNaN(lat) || isNaN(lon)) return;

            const hum = normalizeValue(obs.Humidity);
            const label = hum !== null ? `${hum}%` : '--';
            const color = hum !== null ? getHumidityColor(hum) : '#64748B';

            const icon = this.makeIcon(
                `<div class="hum-marker" style="background-color:${color}">${label}</div>`
            );
            L.marker([lat, lon], { icon })
                .bindPopup(buildPopupHtml(obs), { maxWidth: 260 })
                .addTo(this.humidityLayer);
        });
    }

    private buildWeatherLayer(observations: WeatherObservation[]) {
        this.weatherLayer.clearLayers();
        observations.forEach(obs => {
            const lat = Number(obs.Latitude);
            const lon = Number(obs.Longitude);
            if (isNaN(lat) || isNaN(lon)) return;

            const symbol = getWeatherSymbol(obs.Weather);

            const icon = L.divIcon({
                className: 'custom-marker-wrapper',
                html: `<div class="wx-marker">${symbol}</div>`,
                iconSize:    [34, 34],
                iconAnchor:  [17, 17],
                popupAnchor: [0, -17],
            });
            L.marker([lat, lon], { icon })
                .bindPopup(buildPopupHtml(obs), { maxWidth: 260 })
                .addTo(this.weatherLayer);
        });
    }
}
