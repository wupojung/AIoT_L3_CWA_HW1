import './styles/style.css';
import { WeatherService } from './services/WeatherService';
import { MapManager } from './map/MapManager';
import { LayerControl } from './ui/LayerControl';

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
        showStatus('Loading observations...');

        const weatherService = new WeatherService();
        const observations = await weatherService.getObservations();

        if (!observations || observations.length === 0) {
            showStatus('No weather data available.');
            return;
        }

        hideStatus();

        const mapManager = new MapManager('map');
        mapManager.init();
        mapManager.renderObservations(observations);

        const layerControl = new LayerControl(mapManager);
        layerControl.init();
        layerControl.updateHeader(
            mapManager.getStationCount(),
            mapManager.getLastUpdated()
        );

    } catch (err) {
        console.error(err);
        showStatus('Failed to load data. Please make sure ETL has run.', true);
    }
}

document.addEventListener('DOMContentLoaded', bootstrap);
