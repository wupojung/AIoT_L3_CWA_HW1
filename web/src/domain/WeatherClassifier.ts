import { WeatherObservation } from './WeatherObservation';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DataLayer = 'temperature' | 'humidity' | 'weather';

export interface LegendItem {
    color?: string;
    symbol?: string;
    label: string;
}

export interface LegendData {
    title: string;
    type: 'gradient' | 'symbols';
    items: LegendItem[];
}

// ── Sentinel value handling ───────────────────────────────────────────────────

const SENTINEL_STRINGS = new Set(['-99', '-99.0']);
const SENTINEL_NUMBER = -99;

/**
 * Normalize a raw CWA value.
 * Returns null for sentinel values (-99, -99.0), null, undefined, or NaN.
 */
export function normalizeValue(val: string | number | null | undefined): number | null {
    if (val === null || val === undefined) return null;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed === '' || SENTINEL_STRINGS.has(trimmed)) return null;
        const num = parseFloat(trimmed);
        return isNaN(num) ? null : num;
    }
    if (typeof val === 'number') {
        if (isNaN(val) || val === SENTINEL_NUMBER) return null;
        return val;
    }
    return null;
}

// ── Temperature ───────────────────────────────────────────────────────────────

/**
 * Map a temperature value to a display color.
 */
export function getTempColor(temp: number): string {
    if (temp < 15) return '#60A5FA';  // cool blue
    if (temp < 20) return '#34D399';  // cyan / green
    if (temp < 25) return '#FACC15';  // yellow
    if (temp < 30) return '#FB923C';  // orange
    return '#EF4444';                  // hot red
}

// ── Humidity ──────────────────────────────────────────────────────────────────

/**
 * Map a humidity percentage to a display color.
 */
export function getHumidityColor(humidity: number): string {
    if (humidity < 40) return '#94A3B8';  // dry — slate
    if (humidity < 60) return '#60A5FA';  // medium — blue
    if (humidity < 80) return '#38BDF8';  // humid — sky
    return '#06B6D4';                      // very humid — cyan
}

// ── Weather condition ─────────────────────────────────────────────────────────

/**
 * Map a CWA weather string to a compact display symbol.
 * Returns '--' for null / sentinel values.
 */
export function getWeatherSymbol(weather: string | null | undefined): string {
    if (!weather || weather === '-99' || weather.trim() === '') return '--';
    const w = weather;
    if (w.includes('雨') || w.includes('雷')) return '🌧';
    if (w.includes('霧') || w.includes('霾')) return '🌫';
    if (w.includes('陰')) return '☁';
    if (w.includes('多雲')) return '⛅';
    if (w.includes('晴')) return '☀';
    return '◎';
}

/**
 * Return a user-facing weather label.
 * Returns 'N/A' for null / sentinel values.
 */
export function getWeatherLabel(weather: string | null | undefined): string {
    if (!weather || weather === '-99' || weather.trim() === '') return 'N/A';
    return weather;
}

// ── Legend data ───────────────────────────────────────────────────────────────

/**
 * Return legend descriptor for the given active data layer.
 */
export function getLegendData(layer: DataLayer): LegendData {
    switch (layer) {
        case 'temperature':
            return {
                title: 'Temperature (°C)',
                type: 'gradient',
                items: [
                    { color: '#60A5FA', label: '< 15°C' },
                    { color: '#34D399', label: '15 – 20°C' },
                    { color: '#FACC15', label: '20 – 25°C' },
                    { color: '#FB923C', label: '25 – 30°C' },
                    { color: '#EF4444', label: '≥ 30°C' },
                ],
            };
        case 'humidity':
            return {
                title: 'Humidity (%)',
                type: 'gradient',
                items: [
                    { color: '#94A3B8', label: '< 40% Dry' },
                    { color: '#60A5FA', label: '40 – 60%' },
                    { color: '#38BDF8', label: '60 – 80%' },
                    { color: '#06B6D4', label: '≥ 80% Humid' },
                ],
            };
        case 'weather':
            return {
                title: 'Weather',
                type: 'symbols',
                items: [
                    { symbol: '☀', label: 'Clear' },
                    { symbol: '⛅', label: 'Partly Cloudy' },
                    { symbol: '☁', label: 'Overcast' },
                    { symbol: '🌧', label: 'Rain / Thunder' },
                    { symbol: '🌫', label: 'Fog / Haze' },
                    { symbol: '◎', label: 'Other' },
                ],
            };
    }
}

// ── Popup HTML ────────────────────────────────────────────────────────────────

/**
 * Build the Leaflet popup HTML for a weather observation.
 * All sentinel / null values are normalised to display as '--'.
 */
export function buildPopupHtml(obs: WeatherObservation): string {
    const temp = normalizeValue(obs.Temperature);
    const hum = normalizeValue(obs.Humidity);

    const tempStr = temp !== null ? `${temp}°C` : '--';
    const humStr = hum !== null ? `${hum}%` : '--';
    const symbol = getWeatherSymbol(obs.Weather);
    const wxLabel = getWeatherLabel(obs.Weather);
    const timeStr = obs.ObsTime
        ? new Date(obs.ObsTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
        : '--';

    const symbolPart = symbol !== '--' ? `<span class="popup-wx-symbol">${symbol}</span>` : '';

    return `
        <div class="weather-popup">
            <div class="popup-station">${obs.StationName}</div>
            <div class="popup-location">${obs.County} ${obs.Township}</div>
            <div class="popup-temp">${tempStr}</div>
            <div class="popup-row">
                ${symbolPart}
                <span class="popup-wx-label">${wxLabel}</span>
            </div>
            <div class="popup-row">
                <span class="popup-meta-label">Humidity</span>
                <span>${humStr}</span>
            </div>
            <div class="popup-row">
                <span class="popup-meta-label">Updated</span>
                <span>${timeStr}</span>
            </div>
        </div>
    `;
}
