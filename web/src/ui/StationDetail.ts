import { WeatherObservation } from '../domain/WeatherObservation';
import { normalizeValue, getWeatherSymbol, getWeatherLabel } from '../domain/WeatherClassifier';
import { messages, Lang } from '../i18n/messages';

// ── Helper ────────────────────────────────────────────────────────────────────

function fmt(val: string | number | null | undefined, unit = ''): string {
    const n = normalizeValue(val as string | number | null);
    if (n === null) return '--';
    return `${n}${unit}`;
}

function fmtStr(val: string | null | undefined): string {
    if (!val || val === '-99' || val.trim() === '') return '--';
    return val;
}

function fmtTime(val: string | null | undefined, lang: Lang): string {
    if (!val || val === '-99') return '--';
    try {
        return new Date(val).toLocaleString(lang === 'zh-TW' ? 'zh-TW' : 'en-US', {
            month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return val;
    }
}

function windDeg(val: string | number | null | undefined): string {
    const n = normalizeValue(val as string | number | null);
    if (n === null) return '--';
    return `${n}°`;
}

// ── StationDetail ─────────────────────────────────────────────────────────────

export class StationDetail {
    private el: HTMLElement;
    private contentEl: HTMLElement;
    private closeBtn: HTMLElement;
    private currentObs: WeatherObservation | null = null;
    private currentLang: Lang = 'zh-TW';

    constructor() {
        this.el = document.getElementById('station-detail')!;
        this.contentEl = document.getElementById('station-detail-content')!;
        this.closeBtn = document.getElementById('station-detail-close')!;
        this.closeBtn.addEventListener('click', () => this.close());

        // Close on background click (mobile sheet)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    open(obs: WeatherObservation, lang: Lang) {
        this.currentObs = obs;
        this.currentLang = lang;
        this.render();
        this.el.removeAttribute('hidden');
    }

    close() {
        this.el.setAttribute('hidden', '');
        this.currentObs = null;
    }

    isOpen(): boolean {
        return !this.el.hasAttribute('hidden');
    }

    setLanguage(lang: Lang) {
        this.currentLang = lang;
        const t = messages[lang];
        const titleEl = document.getElementById('sd-title');
        if (titleEl) titleEl.textContent = t.detailTitle;
        this.closeBtn.setAttribute('aria-label', t.ariaCloseDetail);
        if (this.currentObs) this.render();
    }

    private render() {
        if (!this.currentObs) return;
        const obs = this.currentObs;
        const t = messages[this.currentLang];
        const lang = this.currentLang;

        const wxSymbol = getWeatherSymbol(obs.Weather);
        const wxLabel  = getWeatherLabel(obs.Weather, lang);
        const obsTimeStr = fmtTime(obs.ObsTime, lang);

        this.contentEl.innerHTML = `
            <!-- Current Conditions -->
            <div class="sd-section">
                <div class="sd-section-title">${t.currentConditions}</div>
                <div class="sd-grid">
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '天氣' : 'Weather'}</span>
                        <span class="sd-value">${wxSymbol !== '--' ? wxSymbol + ' ' : ''}${wxLabel}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '氣溫' : 'Temperature'}</span>
                        <span class="sd-value">${fmt(obs.Temperature, '°C')}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '相對濕度' : 'Humidity'}</span>
                        <span class="sd-value">${fmt(obs.Humidity, '%')}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '時雨量' : 'Precip (1hr)'}</span>
                        <span class="sd-value">${fmt(obs.Precipitation, ' mm')}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '氣壓' : 'Pressure'}</span>
                        <span class="sd-value">${fmt(obs.AirPressure, ' hPa')}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '紫外線' : 'UV Index'}</span>
                        <span class="sd-value">${fmt(obs.UVIndex)}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.visibility}</span>
                        <span class="sd-value">${fmtStr(obs.VisibilityDescription)}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.sunshine}</span>
                        <span class="sd-value">${fmt(obs.SunshineDuration, lang === 'zh-TW' ? ' 小時' : ' hr')}</span>
                    </div>
                </div>
            </div>

            <!-- Wind -->
            <div class="sd-section">
                <div class="sd-section-title">${t.windSection}</div>
                <div class="sd-grid">
                    <div class="sd-row">
                        <span class="sd-label">${t.windDir}</span>
                        <span class="sd-value">${windDeg(obs.WindDirection)}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.windSpeed}</span>
                        <span class="sd-value">${fmt(obs.WindSpeed, ' m/s')}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.maxWind}</span>
                        <span class="sd-value">${fmt(obs.Max10MinAverage_WindSpeed, ' m/s')} ${windDeg(obs.Max10MinAverage_WindDirection)}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.gust}</span>
                        <span class="sd-value">${fmt(obs.GustInfo_PeakGustSpeed, ' m/s')} ${windDeg(obs.GustInfo_WindDirection)}</span>
                    </div>
                </div>
            </div>

            <!-- Today -->
            <div class="sd-section">
                <div class="sd-section-title">${t.today}</div>
                <div class="sd-grid">
                    <div class="sd-row">
                        <span class="sd-label">${t.dailyHigh}</span>
                        <span class="sd-value">${fmt(obs.DailyHigh_AirTemperature, '°C')} <small class="sd-time">${fmtTime(obs.DailyHigh_DateTime, lang)}</small></span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.dailyLow}</span>
                        <span class="sd-value">${fmt(obs.DailyLow_AirTemperature, '°C')} <small class="sd-time">${fmtTime(obs.DailyLow_DateTime, lang)}</small></span>
                    </div>
                </div>
            </div>

            <!-- Station Info -->
            <div class="sd-section">
                <div class="sd-section-title">${t.stationInfo}</div>
                <div class="sd-grid">
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '測站名稱' : 'Station Name'}</span>
                        <span class="sd-value">${fmtStr(obs.StationName)}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.stationId}</span>
                        <span class="sd-value">${fmtStr(obs.StationId)}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '縣市' : 'County'}</span>
                        <span class="sd-value">${fmtStr(obs.County)}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${lang === 'zh-TW' ? '鄉鎮' : 'Township'}</span>
                        <span class="sd-value">${fmtStr(obs.Township)}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.altitude}</span>
                        <span class="sd-value">${fmt(obs.StationAltitude, ' m')}</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.coordinates}</span>
                        <span class="sd-value">${fmt(obs.Latitude)}°N, ${fmt(obs.Longitude)}°E</span>
                    </div>
                    <div class="sd-row">
                        <span class="sd-label">${t.obsTime}</span>
                        <span class="sd-value">${obsTimeStr}</span>
                    </div>
                </div>
            </div>
        `;
    }
}
