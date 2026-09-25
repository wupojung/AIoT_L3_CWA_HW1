import { WeatherObservation } from './WeatherObservation';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DataLayer = 'temperature' | 'humidity' | 'weather' | 'windSpeed' | 'precipitation';

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

export function getTempColor(temp: number): string {
    if (temp < 15) return '#60A5FA';  // cool blue
    if (temp < 20) return '#34D399';  // cyan / green
    if (temp < 25) return '#FACC15';  // yellow
    if (temp < 30) return '#FB923C';  // orange
    return '#EF4444';                  // hot red
}

// ── Humidity ──────────────────────────────────────────────────────────────────

export function getHumidityColor(humidity: number): string {
    if (humidity < 40) return '#94A3B8';  // dry — slate
    if (humidity < 60) return '#60A5FA';  // medium — blue
    if (humidity < 80) return '#38BDF8';  // humid — sky
    return '#06B6D4';                      // very humid — cyan
}

// ── Wind Speed ────────────────────────────────────────────────────────────────

export function getWindSpeedColor(speed: number): string {
    if (speed < 3.3) return '#A7F3D0'; // Light (< 3.3 m/s)
    if (speed < 7.9) return '#34D399'; // Moderate (< 7.9 m/s)
    if (speed < 13.8) return '#FBBF24'; // Strong (< 13.8 m/s)
    return '#EF4444'; // Gale or higher
}

// ── Precipitation ─────────────────────────────────────────────────────────────

export function getPrecipitationColor(precip: number): string {
    if (precip === 0) return '#E2E8F0'; // None
    if (precip < 5) return '#93C5FD'; // Light (< 5mm)
    if (precip < 20) return '#3B82F6'; // Moderate (< 20mm)
    if (precip < 50) return '#1D4ED8'; // Heavy (< 50mm)
    return '#4C1D95'; // Extreme
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

export type Lang = 'en' | 'zh';

const LEGEND_I18N = {
    en: {
        tempTitle: 'Temperature (°C)',
        humTitle: 'Humidity (%)',
        wxTitle: 'Weather',
        windTitle: 'Wind Speed (m/s)',
        precipTitle: 'Precipitation (mm)',
        dry: 'Dry',
        humid: 'Humid',
        clear: 'Clear',
        partlyCloudy: 'Partly Cloudy',
        overcast: 'Overcast',
        rainThunder: 'Rain / Thunder',
        fogHaze: 'Fog / Haze',
        other: 'Other',
        light: 'Light',
        mod: 'Mod',
        str: 'Str',
        gale: 'Gale',
        hvy: 'Hvy',
        extrm: 'Extrm'
    },
    zh: {
        tempTitle: '氣溫 (°C)',
        humTitle: '相對濕度 (%)',
        wxTitle: '天氣狀態',
        windTitle: '陣風/風速 (m/s)',
        precipTitle: '降雨量 (mm)',
        dry: '乾燥',
        humid: '潮濕',
        clear: '晴',
        partlyCloudy: '多雲',
        overcast: '陰',
        rainThunder: '雨/雷',
        fogHaze: '霧/霾',
        other: '其他',
        light: '微弱',
        mod: '中等',
        str: '強勁',
        gale: '疾風',
        hvy: '大雨',
        extrm: '極端'
    }
};

/**
 * Return legend descriptor for the given active data layer.
 */
export function getLegendData(layer: DataLayer, lang: Lang = 'en'): LegendData {
    const t = LEGEND_I18N[lang];
    switch (layer) {
        case 'temperature':
            return {
                title: t.tempTitle,
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
                title: t.humTitle,
                type: 'gradient',
                items: [
                    { color: '#94A3B8', label: `< 40% ${t.dry}` },
                    { color: '#60A5FA', label: '40 – 60%' },
                    { color: '#38BDF8', label: '60 – 80%' },
                    { color: '#06B6D4', label: `≥ 80% ${t.humid}` },
                ],
            };
        case 'weather':
            return {
                title: t.wxTitle,
                type: 'symbols',
                items: [
                    { symbol: '☀', label: t.clear },
                    { symbol: '⛅', label: t.partlyCloudy },
                    { symbol: '☁', label: t.overcast },
                    { symbol: '🌧', label: t.rainThunder },
                    { symbol: '🌫', label: t.fogHaze },
                    { symbol: '◎', label: t.other },
                ],
            };
        case 'windSpeed':
            return {
                title: t.windTitle,
                type: 'gradient',
                items: [
                    { color: '#A7F3D0', label: `< 3.3 ${t.light}` },
                    { color: '#34D399', label: `3.3 – 7.9 ${t.mod}` },
                    { color: '#FBBF24', label: `7.9 – 13.8 ${t.str}` },
                    { color: '#EF4444', label: `≥ 13.8 ${t.gale}` },
                ],
            };
        case 'precipitation':
            return {
                title: t.precipTitle,
                type: 'gradient',
                items: [
                    { color: '#E2E8F0', label: '0 mm' },
                    { color: '#93C5FD', label: `< 5 ${t.light}` },
                    { color: '#3B82F6', label: `5 – 20 ${t.mod}` },
                    { color: '#1D4ED8', label: `20 – 50 ${t.hvy}` },
                    { color: '#4C1D95', label: `≥ 50 ${t.extrm}` },
                ],
            };
    }
}

// ── Popup HTML ────────────────────────────────────────────────────────────────

const I18N = {
    en: {
        humidity: 'Humidity',
        updated: 'Updated',
        wind: 'Wind',
        precip: 'Precip (1hr)',
        uv: 'UV Index',
        visibility: 'Visibility',
        na: 'N/A'
    },
    zh: {
        humidity: '濕度',
        updated: '更新時間',
        wind: '風速',
        precip: '時雨量',
        uv: '紫外線',
        visibility: '能見度',
        na: '無資料'
    }
};

/**
 * Build the Leaflet popup HTML for a weather observation.
 * All sentinel / null values are normalised to display as '--'.
 */
export function buildPopupHtml(obs: WeatherObservation, lang: Lang = 'en'): string {
    const t = I18N[lang];
    
    const temp = normalizeValue(obs.Temperature);
    const hum = normalizeValue(obs.Humidity);
    const wind = normalizeValue(obs.WindSpeed);
    const precip = normalizeValue(obs.Precipitation);
    const uv = normalizeValue(obs.UVIndex);
    const vis = obs.VisibilityDescription && obs.VisibilityDescription !== '-99' ? obs.VisibilityDescription : null;

    const tempStr = temp !== null ? `${temp}°C` : '--';
    const humStr = hum !== null ? `${hum}%` : '--';
    const windStr = wind !== null ? `${wind} m/s` : '--';
    const precipStr = precip !== null ? `${precip} mm` : '--';
    const uvStr = uv !== null ? uv : '--';
    const visStr = vis !== null ? vis : '--';
    
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
                <span class="popup-meta-label">${t.humidity}</span>
                <span>${humStr}</span>
            </div>
            <div class="popup-row">
                <span class="popup-meta-label">${t.wind}</span>
                <span>${windStr}</span>
            </div>
            <div class="popup-row">
                <span class="popup-meta-label">${t.precip}</span>
                <span>${precipStr}</span>
            </div>
            <div class="popup-row">
                <span class="popup-meta-label">${t.uv} / ${t.visibility}</span>
                <span>${uvStr} / ${visStr}</span>
            </div>
            <div class="popup-row">
                <span class="popup-meta-label">${t.updated}</span>
                <span>${timeStr}</span>
            </div>
        </div>
    `;
}
