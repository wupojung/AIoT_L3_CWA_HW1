import { MapManager } from '../map/MapManager';
import { DataLayer, getLegendData } from '../domain/WeatherClassifier';

export class LayerControl {
    constructor(private mapManager: MapManager) {}

    init() {
        this.bindBasemapControls();
        this.bindDataLayerControls();
        this.bindPanelToggle();
        this.bindLanguageToggle();
        this.updateLegend('temperature');
        this.setLanguage('zh'); // Default to Chinese as per standard or let it stay 'en'
    }

    updateHeader() {
        const count = this.mapManager.getStationCount();
        const updated = this.mapManager.getLastUpdated();
        const countEl = document.getElementById('station-count');
        const timeEl  = document.getElementById('last-updated');
        
        const t = this.translations[this.currentLang];
        if (countEl) countEl.textContent = `${count} ${t.stations}`;
        if (timeEl && updated) {
            const timeStr = new Date(updated).toLocaleTimeString(this.currentLang === 'zh' ? 'zh-TW' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
            timeEl.textContent = `${t.updated} ${timeStr}`;
        }
    }

    updateLegend(layer: DataLayer) {
        const el = document.getElementById('legend');
        if (!el) return;
        const data = getLegendData(layer, this.currentLang);

        if (data.type === 'gradient') {
            el.innerHTML = `
                <div class="legend-title">${data.title}</div>
                <div class="legend-gradient-row">
                    ${data.items.map(item => `
                        <div class="legend-item">
                            <div class="legend-dot" style="background-color:${item.color}"></div>
                            <div class="legend-label">${item.label}</div>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            el.innerHTML = `
                <div class="legend-title">${data.title}</div>
                <div class="legend-symbols">
                    ${data.items.map(item => `
                        <div class="legend-symbol-row">
                            <span class="legend-symbol">${item.symbol}</span>
                            <span class="legend-label">${item.label}</span>
                        </div>
                    `).join('')}
                </div>`;
        }
    }

    private currentLang: 'en' | 'zh' = 'en';

    private translations = {
        en: {
            stations: 'stations',
            updated: 'Updated',
            layers: 'Layers',
            basemap: 'BASE MAP',
            dark: 'Dark',
            light: 'Light',
            datalayer: 'DATA LAYER',
            temp: '🌡 Temperature',
            hum: '💧 Humidity',
            wx: '⛅ Weather',
            wind: '💨 Wind Speed',
            precip: '☔ Precipitation',
            toggleBtn: '🇹🇼 中文'
        },
        zh: {
            stations: '個測站',
            updated: '更新時間',
            layers: '圖層控制',
            basemap: '底圖',
            dark: '深色 (Dark)',
            light: '淺色 (Light)',
            datalayer: '資料圖層',
            temp: '🌡 氣溫',
            hum: '💧 相對濕度',
            wx: '⛅ 天氣狀態',
            wind: '💨 陣風/風速',
            precip: '☔ 降雨量',
            toggleBtn: '🇬🇧 English'
        }
    };

    setLanguage(lang: 'en' | 'zh') {
        this.currentLang = lang;
        const t = this.translations[lang];
        
        // Update DOM labels
        document.getElementById('ui-label-layers')!.textContent = t.layers;
        document.getElementById('ui-label-basemap')!.textContent = t.basemap;
        document.getElementById('ui-label-dark')!.textContent = t.dark;
        document.getElementById('ui-label-light')!.textContent = t.light;
        document.getElementById('ui-label-datalayer')!.textContent = t.datalayer;
        document.getElementById('ui-label-temp')!.textContent = t.temp;
        document.getElementById('ui-label-hum')!.textContent = t.hum;
        document.getElementById('ui-label-wx')!.textContent = t.wx;
        document.getElementById('ui-label-wind')!.textContent = t.wind;
        document.getElementById('ui-label-precip')!.textContent = t.precip;
        document.getElementById('lang-toggle')!.textContent = t.toggleBtn;

        // Re-render legend with current layer
        this.updateLegend(this.mapManager.getActiveDataLayer());
        
        // Update header and mapManager language
        this.updateHeader();
        this.mapManager.setLanguage(lang);
    }

    private bindLanguageToggle() {
        const toggleBtn = document.getElementById('lang-toggle');
        if (!toggleBtn) return;
        toggleBtn.addEventListener('click', () => {
            const newLang = this.currentLang === 'en' ? 'zh' : 'en';
            this.setLanguage(newLang);
        });
    }

    private bindBasemapControls() {
        document.querySelectorAll<HTMLInputElement>('input[name="basemap"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.mapManager.setBasemap(radio.value as 'dark' | 'light');
                }
            });
        });
    }

    private bindDataLayerControls() {
        document.querySelectorAll<HTMLInputElement>('input[name="datalayer"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    const layer = radio.value as DataLayer;
                    this.mapManager.setDataLayer(layer);
                    this.updateLegend(layer);
                }
            });
        });
    }

    private bindPanelToggle() {
        const toggleBtn = document.getElementById('panel-toggle');
        const panel     = document.getElementById('layer-panel');
        if (!toggleBtn || !panel) return;

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('open');
        });

        // Close panel on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (panel.classList.contains('open') && !panel.contains(e.target as Node)) {
                panel.classList.remove('open');
            }
        });
    }
}
