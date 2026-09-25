import { MapManager } from '../map/MapManager';
import { DataLayer, getLegendData, Lang } from '../domain/WeatherClassifier';
import { messages } from '../i18n/messages';

export class LayerControl {
    constructor(private mapManager: MapManager) {}

    init() {
        this.bindBasemapControls();
        this.bindDataLayerControls();
        this.bindPanelToggle();
        this.bindLanguageToggle();
        this.updateLegend('temperature');
        const savedLang = (localStorage.getItem('twsky_locale') as Lang) || 'zh-TW';
        this.setLanguage(savedLang);
    }

    updateHeader() {
        const count = this.mapManager.getStationCount();
        const updated = this.mapManager.getLastUpdated();
        const countEl = document.getElementById('station-count');
        const timeEl  = document.getElementById('last-updated');
        
        if (countEl) countEl.textContent = count.toString();
        if (timeEl && updated) {
            const timeStr = new Date(updated).toLocaleTimeString(this.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
            timeEl.textContent = timeStr;
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

    private currentLang: Lang = 'zh-TW';

    setLanguage(lang: Lang) {
        this.currentLang = lang;
        const t = messages[lang];
        
        // Update document meta
        document.documentElement.lang = lang;
        document.title = t.browserTitle;
        localStorage.setItem('twsky_locale', lang);

        // Update DOM labels
        document.getElementById('ui-product-name')!.textContent = t.productName;
        document.getElementById('ui-tagline')!.textContent = t.tagline;
        document.getElementById('ui-stations')!.textContent = t.stations;
        document.getElementById('ui-updated')!.textContent = t.updated;
        document.getElementById('ui-datasource')!.textContent = t.dataSource;

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
        document.getElementById('lang-toggle')!.textContent = t.langToggle;
        
        // Update aria-labels
        document.querySelector('.app-header')?.setAttribute('aria-label', t.ariaAppTitle);
        document.getElementById('layer-panel')?.setAttribute('aria-label', t.ariaMapLayers);
        document.getElementById('panel-toggle')?.setAttribute('aria-label', t.ariaTogglePanel);
        document.getElementById('ui-label-toggle-panel')!.textContent = t.layers;
        document.getElementById('legend')?.setAttribute('aria-label', t.ariaMapLegend);
        
        document.getElementById('basemap-dark')?.setAttribute('aria-label', t.ariaDark);
        document.getElementById('basemap-light')?.setAttribute('aria-label', t.ariaLight);
        document.getElementById('layer-temp')?.setAttribute('aria-label', t.ariaTemp);
        document.getElementById('layer-hum')?.setAttribute('aria-label', t.ariaHum);
        document.getElementById('layer-wx')?.setAttribute('aria-label', t.ariaWx);
        document.getElementById('layer-wind')?.setAttribute('aria-label', t.ariaWind);
        document.getElementById('layer-precip')?.setAttribute('aria-label', t.ariaPrecip);

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
            const newLang = this.currentLang === 'en' ? 'zh-TW' : 'en';
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
