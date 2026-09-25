export type Lang = 'zh-TW' | 'en';

export const messages = {
    'zh-TW': {
        brand: 'TW Sky',
        productName: '島嶼氣象圖譜',
        tagline: '一張地圖，看見全台即時天氣。',
        stations: '個觀測站',
        updated: '更新於',
        dataSource: '資料來源 · 中央氣象署',
        langToggle: '中文 | EN',
        
        // Panels
        layers: '地圖圖層',
        basemap: '底圖',
        dark: '深色',
        light: '淺色',
        datalayer: '氣象資料',
        temp: '氣溫',
        hum: '相對濕度',
        wx: '天氣現象',
        wind: '陣風/風速',
        precip: '降雨量',
        
        // Status
        loading: '正在載入氣象觀測資料…',
        noData: '暫無觀測資料',
        failed: '氣象資料載入失敗',
        
        // Aria labels
        ariaAppTitle: '應用程式標題',
        ariaMapLayers: '地圖圖層',
        ariaTogglePanel: '切換圖層面板',
        ariaMapLegend: '地圖圖例',
        ariaDark: '深色底圖',
        ariaLight: '淺色底圖',
        ariaTemp: '氣溫圖層',
        ariaHum: '相對濕度圖層',
        ariaWx: '天氣現象圖層',
        ariaWind: '陣風/風速圖層',
        ariaPrecip: '降雨量圖層',
        
        // Browser Title
        browserTitle: 'TW Sky｜島嶼氣象圖譜'
    },
    'en': {
        brand: 'TW Sky',
        productName: 'Live Weather Atlas',
        tagline: "Explore Taiwan's weather, station by station.",
        stations: 'Stations',
        updated: 'Updated',
        dataSource: 'Data · Central Weather Administration',
        langToggle: '中 | EN',
        
        // Panels
        layers: 'Map Layers',
        basemap: 'BASEMAP',
        dark: 'Dark',
        light: 'Light',
        datalayer: 'WEATHER',
        temp: 'Temperature',
        hum: 'Humidity',
        wx: 'Conditions',
        wind: 'Wind Speed',
        precip: 'Precipitation',
        
        // Status
        loading: 'Loading weather observations…',
        noData: 'No observations available',
        failed: 'Failed to load weather data',
        
        // Aria labels
        ariaAppTitle: 'Application title',
        ariaMapLayers: 'Map layers',
        ariaTogglePanel: 'Toggle map layers',
        ariaMapLegend: 'Map legend',
        ariaDark: 'Dark basemap',
        ariaLight: 'Light basemap',
        ariaTemp: 'Temperature layer',
        ariaHum: 'Humidity layer',
        ariaWx: 'Weather conditions layer',
        ariaWind: 'Wind Speed layer',
        ariaPrecip: 'Precipitation layer',
        
        // Browser Title
        browserTitle: 'TW Sky — Live Weather Atlas'
    }
};
