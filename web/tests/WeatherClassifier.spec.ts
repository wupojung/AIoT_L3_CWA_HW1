import { describe, it, expect } from 'vitest';
import {
    normalizeValue,
    getTempColor,
    getHumidityColor,
    getWeatherSymbol,
    getWeatherLabel,
    getLegendData,
    getAirPressureColor,
    getUVIndexColor,
} from '../src/domain/WeatherClassifier';

// ── normalizeValue ────────────────────────────────────────────────────────────

describe('normalizeValue', () => {
    it('returns null for null', () => {
        expect(normalizeValue(null)).toBeNull();
    });

    it('returns null for undefined', () => {
        expect(normalizeValue(undefined)).toBeNull();
    });

    it('returns null for sentinel string "-99"', () => {
        expect(normalizeValue('-99')).toBeNull();
    });

    it('returns null for sentinel string "-99.0"', () => {
        expect(normalizeValue('-99.0')).toBeNull();
    });

    it('returns null for sentinel number -99', () => {
        expect(normalizeValue(-99)).toBeNull();
    });

    it('returns null for empty string', () => {
        expect(normalizeValue('')).toBeNull();
    });

    it('returns null for non-numeric string', () => {
        expect(normalizeValue('N/A')).toBeNull();
    });

    it('parses a valid string number', () => {
        expect(normalizeValue('25.3')).toBe(25.3);
    });

    it('passes through a valid number', () => {
        expect(normalizeValue(26)).toBe(26);
    });

    it('passes through zero', () => {
        expect(normalizeValue(0)).toBe(0);
    });

    it('handles negative temperature (non-sentinel)', () => {
        expect(normalizeValue(-5)).toBe(-5);
    });

    it('handles string with leading/trailing spaces', () => {
        expect(normalizeValue('  28.1  ')).toBe(28.1);
    });
});

// ── getTempColor ──────────────────────────────────────────────────────────────

describe('getTempColor', () => {
    it('returns blue for temp < 15', () => {
        expect(getTempColor(10)).toBe('#60A5FA');
        expect(getTempColor(14.9)).toBe('#60A5FA');
    });

    it('returns cyan/green for 15 <= temp < 20', () => {
        expect(getTempColor(15)).toBe('#34D399');
        expect(getTempColor(19.9)).toBe('#34D399');
    });

    it('returns yellow for 20 <= temp < 25', () => {
        expect(getTempColor(20)).toBe('#FACC15');
        expect(getTempColor(24.9)).toBe('#FACC15');
    });

    it('returns orange for 25 <= temp < 30', () => {
        expect(getTempColor(25)).toBe('#FB923C');
        expect(getTempColor(29.9)).toBe('#FB923C');
    });

    it('returns red for temp >= 30', () => {
        expect(getTempColor(30)).toBe('#EF4444');
        expect(getTempColor(36)).toBe('#EF4444');
    });
});

// ── getHumidityColor ──────────────────────────────────────────────────────────

describe('getHumidityColor', () => {
    it('returns slate for humidity < 40 (dry)', () => {
        expect(getHumidityColor(20)).toBe('#94A3B8');
        expect(getHumidityColor(39.9)).toBe('#94A3B8');
    });

    it('returns blue for 40 <= humidity < 60', () => {
        expect(getHumidityColor(40)).toBe('#60A5FA');
        expect(getHumidityColor(59.9)).toBe('#60A5FA');
    });

    it('returns sky for 60 <= humidity < 80', () => {
        expect(getHumidityColor(60)).toBe('#38BDF8');
        expect(getHumidityColor(79.9)).toBe('#38BDF8');
    });

    it('returns cyan for humidity >= 80 (very humid)', () => {
        expect(getHumidityColor(80)).toBe('#06B6D4');
        expect(getHumidityColor(100)).toBe('#06B6D4');
    });
});

// ── getWeatherSymbol ──────────────────────────────────────────────────────────

describe('getWeatherSymbol', () => {
    it('returns "--" for null', () => {
        expect(getWeatherSymbol(null)).toBe('--');
    });

    it('returns "--" for undefined', () => {
        expect(getWeatherSymbol(undefined)).toBe('--');
    });

    it('returns "--" for empty string', () => {
        expect(getWeatherSymbol('')).toBe('--');
    });

    it('returns "--" for sentinel "-99"', () => {
        expect(getWeatherSymbol('-99')).toBe('--');
    });

    it('returns ☀ for 晴', () => {
        expect(getWeatherSymbol('晴')).toBe('☀');
    });

    it('returns ⛅ for 多雲 (takes priority over 晴 in 晴時多雲)', () => {
        expect(getWeatherSymbol('晴時多雲')).toBe('⛅');
        expect(getWeatherSymbol('多雲')).toBe('⛅');
    });

    it('returns ☁ for 陰', () => {
        expect(getWeatherSymbol('陰天')).toBe('☁');
        expect(getWeatherSymbol('陰')).toBe('☁');
    });

    it('returns 🌧 for 雨', () => {
        expect(getWeatherSymbol('下雨')).toBe('🌧');
        expect(getWeatherSymbol('大雨')).toBe('🌧');
    });

    it('returns 🌧 for 雷', () => {
        expect(getWeatherSymbol('雷陣雨')).toBe('🌧');
    });

    it('returns 🌫 for 霧', () => {
        expect(getWeatherSymbol('霧')).toBe('🌫');
    });

    it('returns ◎ for unknown condition', () => {
        expect(getWeatherSymbol('Unknown')).toBe('◎');
    });
});

// ── getWeatherLabel ───────────────────────────────────────────────────────────

describe('getWeatherLabel', () => {
    it('returns "N/A" for null in en mode', () => {
        expect(getWeatherLabel(null, 'en')).toBe('N/A');
    });

    it('returns "N/A" for undefined in en mode', () => {
        expect(getWeatherLabel(undefined, 'en')).toBe('N/A');
    });

    it('returns "N/A" for empty string in en mode', () => {
        expect(getWeatherLabel('', 'en')).toBe('N/A');
    });

    it('returns "N/A" for sentinel "-99" in en mode', () => {
        expect(getWeatherLabel('-99', 'en')).toBe('N/A');
    });

    it('returns Chinese raw string in zh-TW mode (default)', () => {
        expect(getWeatherLabel('晴時多雲')).toBe('晴時多雲');
        expect(getWeatherLabel('多雲')).toBe('多雲');
        expect(getWeatherLabel('陰天')).toBe('陰天');
    });

    it('returns "無資料" for null in zh-TW mode', () => {
        expect(getWeatherLabel(null, 'zh-TW')).toBe('無資料');
        expect(getWeatherLabel('-99', 'zh-TW')).toBe('無資料');
    });

    it('translates 多雲 to Partly Cloudy in en mode', () => {
        expect(getWeatherLabel('多雲', 'en')).toBe('Partly Cloudy');
    });

    it('translates 晴 to Clear in en mode', () => {
        expect(getWeatherLabel('晴', 'en')).toBe('Clear');
    });

    it('translates 陰 to Overcast in en mode', () => {
        expect(getWeatherLabel('陰', 'en')).toBe('Overcast');
    });

    it('translates 雷陣雨 to Thunderstorm in en mode', () => {
        expect(getWeatherLabel('雷陣雨', 'en')).toBe('Thunderstorm');
    });

    it('falls back to raw string for unmapped weather in en mode', () => {
        expect(getWeatherLabel('特殊天氣', 'en')).toBe('特殊天氣');
    });
});

// ── getLegendData ─────────────────────────────────────────────────────────────

describe('getLegendData', () => {
    it('returns temperature legend with 5 gradient items', () => {
        const data = getLegendData('temperature');
        expect(data.type).toBe('gradient');
        expect(data.title).toContain('Temperature');
        expect(data.items).toHaveLength(5);
        data.items.forEach(item => {
            expect(typeof item.color).toBe('string');
            expect(typeof item.label).toBe('string');
        });
    });

    it('returns humidity legend with 4 gradient items', () => {
        const data = getLegendData('humidity');
        expect(data.type).toBe('gradient');
        expect(data.title).toContain('Humidity');
        expect(data.items).toHaveLength(4);
        data.items.forEach(item => {
            expect(typeof item.color).toBe('string');
            expect(typeof item.label).toBe('string');
        });
    });

    it('returns weather legend with symbol items', () => {
        const data = getLegendData('weather');
        expect(data.type).toBe('symbols');
        expect(data.title).toContain('Conditions');
        expect(data.items.length).toBeGreaterThan(0);
        data.items.forEach(item => {
            expect(typeof item.symbol).toBe('string');
            expect(typeof item.label).toBe('string');
        });
    });

    it('returns pressure legend with 4 gradient items', () => {
        const data = getLegendData('pressure');
        expect(data.type).toBe('gradient');
        expect(data.title).toContain('Pressure');
        expect(data.items).toHaveLength(4);
        data.items.forEach(item => {
            expect(typeof item.color).toBe('string');
            expect(typeof item.label).toBe('string');
        });
    });

    it('returns pressure legend in zh-TW with Chinese labels', () => {
        const data = getLegendData('pressure', 'zh-TW');
        expect(data.title).toBe('氣壓 (hPa)');
        expect(data.items[0].label).toContain('低壓');
        expect(data.items[1].label).toContain('正常');
        expect(data.items[2].label).toContain('偏高');
        expect(data.items[3].label).toContain('高壓');
    });

    it('returns uvIndex legend with 5 gradient items', () => {
        const data = getLegendData('uvIndex');
        expect(data.type).toBe('gradient');
        expect(data.title).toContain('UV');
        expect(data.items).toHaveLength(5);
        data.items.forEach(item => {
            expect(typeof item.color).toBe('string');
            expect(typeof item.label).toBe('string');
        });
    });

    it('returns uvIndex legend in zh-TW with CWA standard Chinese labels', () => {
        const data = getLegendData('uvIndex', 'zh-TW');
        expect(data.title).toBe('紫外線指數');
        expect(data.items[0].label).toContain('低量級');
        expect(data.items[1].label).toContain('中量級');
        expect(data.items[2].label).toContain('高量級');
        expect(data.items[3].label).toContain('過量級');
        expect(data.items[4].label).toContain('危險級');
    });

    it('returns valid legend for all 7 DataLayer values', () => {
        const layers: DataLayer[] = ['temperature', 'humidity', 'weather', 'windSpeed', 'precipitation', 'pressure', 'uvIndex'];
        layers.forEach(layer => {
            const data = getLegendData(layer);
            expect(data.title).toBeTruthy();
            expect(data.items.length).toBeGreaterThan(0);
        });
    });
});

// ── getAirPressureColor ───────────────────────────────────────────────────────

describe('getAirPressureColor', () => {
    it('returns light blue for low pressure (< 1000)', () => {
        expect(getAirPressureColor(990)).toBe('#7DD3FC');
        expect(getAirPressureColor(999.9)).toBe('#7DD3FC');
    });

    it('returns slate for normal pressure (1000–1009)', () => {
        expect(getAirPressureColor(1000)).toBe('#94A3B8');
        expect(getAirPressureColor(1005)).toBe('#94A3B8');
    });

    it('returns amber for high-normal (1010–1015)', () => {
        expect(getAirPressureColor(1010)).toBe('#FCD34D');
        expect(getAirPressureColor(1015)).toBe('#FCD34D');
    });

    it('returns orange for high pressure (>= 1016)', () => {
        expect(getAirPressureColor(1016)).toBe('#F97316');
        expect(getAirPressureColor(1025)).toBe('#F97316');
    });
});

// ── getUVIndexColor ───────────────────────────────────────────────────────────

describe('getUVIndexColor', () => {
    it('returns green for UV 0–2 (Low)', () => {
        expect(getUVIndexColor(0)).toBe('#10B981');
        expect(getUVIndexColor(2)).toBe('#10B981');
    });

    it('returns yellow for UV 3–5 (Moderate)', () => {
        expect(getUVIndexColor(3)).toBe('#FACC15');
        expect(getUVIndexColor(5)).toBe('#FACC15');
    });

    it('returns orange for UV 6–7 (High)', () => {
        expect(getUVIndexColor(6)).toBe('#FB923C');
        expect(getUVIndexColor(7)).toBe('#FB923C');
    });

    it('returns red for UV 8–10 (Very High)', () => {
        expect(getUVIndexColor(8)).toBe('#EF4444');
        expect(getUVIndexColor(10)).toBe('#EF4444');
    });

    it('returns purple for UV >= 11 (Extreme)', () => {
        expect(getUVIndexColor(11)).toBe('#8B5CF6');
        expect(getUVIndexColor(14)).toBe('#8B5CF6');
    });
});
