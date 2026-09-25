import './styles/style.css';
import { WeatherService } from './services/WeatherService';
import { MapManager } from './map/MapManager';
import { LayerControl } from './ui/LayerControl';
import { messages } from './i18n/messages';
import { Lang } from './domain/WeatherClassifier';

async function bootstrap() {
    const statusOverlay = document.getElementById('status-overlay')!;
    const statusMessage = document.getElementById('status-message')!;

    const showStatus = (msg: string, isError = false) => {
        statusOverlay.style.display = 'flex';
        statusMessage.textContent = msg;
        if (isError) statusMessage.style.color = '#EF4444';
    };

    const hideStatus = () => {
        statusOverlay.style.display = 'none';
    };

    try {
        const initialLang = (localStorage.getItem('twsky_locale') as Lang) || 'zh-TW';
        const t = messages[initialLang];
        showStatus(t.loading);

        const weatherService = new WeatherService();
        const observations = await weatherService.getObservations();

        if (!observations || observations.length === 0) {
            showStatus(t.noData);
            return;
        }

        hideStatus();

        const mapManager = new MapManager('map');
        mapManager.init();
        mapManager.renderObservations(observations);

        const layerControl = new LayerControl(mapManager);
        layerControl.init();
        layerControl.updateHeader();

    } catch (err) {
        console.error(err);
        const errLang = (localStorage.getItem('twsky_locale') as Lang) || 'zh-TW';
        showStatus(messages[errLang].failed, true);
    }
}

document.addEventListener('DOMContentLoaded', bootstrap);
