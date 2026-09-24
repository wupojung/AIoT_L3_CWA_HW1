CREATE TABLE IF NOT EXISTS weather_observations (
    StationId TEXT PRIMARY KEY,
    StationName TEXT,
    County TEXT,
    Township TEXT,
    Latitude REAL,
    Longitude REAL,
    ObsTime DATETIME,
    Weather TEXT,
    Temperature REAL,
    Humidity REAL,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
