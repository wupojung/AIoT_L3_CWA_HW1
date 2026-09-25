import { MapManager } from '../map/MapManager';
import { DataLayer, getLegendData } from '../domain/WeatherClassifier';

export class LayerControl {
    constructor(private mapManager: MapManager) {}

    init() {
        this.bindBasemapControls();
        this.bindDataLayerControls();
        this.bindPanelToggle();
        this.updateLegend('temperature');
    }

    updateHeader(stationCount: number, lastUpdated: string | null) {
        const countEl = document.getElementById('station-count');
        const timeEl  = document.getElementById('last-updated');
        if (countEl) countEl.textContent = `${stationCount} stations`;
        if (timeEl && lastUpdated) {
            const t = new Date(lastUpdated).toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit',
            });
            timeEl.textContent = `Updated ${t}`;
        }
    }

    updateLegend(layer: DataLayer) {
        const el = document.getElementById('legend');
        if (!el) return;
        const data = getLegendData(layer);

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

    // ── Private ──────────────────────────────────────────────────────────────

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
