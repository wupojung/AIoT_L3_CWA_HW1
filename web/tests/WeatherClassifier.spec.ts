import { describe, it, expect } from 'vitest';
import {
    normalizeValue,
    getTempColor,
    getHumidityColor,
    getWeatherSymbol,
    getWeatherLabel,
    getLegendData,
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
    it('returns "N/A" for null', () => {
        expect(getWeatherLabel(null)).toBe('N/A');
    });

    it('returns "N/A" for undefined', () => {
        expect(getWeatherLabel(undefined)).toBe('N/A');
    });

    it('returns "N/A" for empty string', () => {
        expect(getWeatherLabel('')).toBe('N/A');
    });

    it('returns "N/A" for sentinel "-99"', () => {
        expect(getWeatherLabel('-99')).toBe('N/A');
    });

    it('returns the original string for valid weather', () => {
        expect(getWeatherLabel('晴時多雲')).toBe('晴時多雲');
        expect(getWeatherLabel('多雲')).toBe('多雲');
        expect(getWeatherLabel('陰天')).toBe('陰天');
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
        expect(data.title).toContain('Weather');
        expect(data.items.length).toBeGreaterThan(0);
        data.items.forEach(item => {
            expect(typeof item.symbol).toBe('string');
            expect(typeof item.label).toBe('string');
        });
    });
});
