import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeatherService } from '../src/services/WeatherService';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('WeatherService', () => {
    let service: WeatherService;

    beforeEach(() => {
        service = new WeatherService('/mock.json');
        mockFetch.mockReset();
    });

    it('should fetch and return observations on success', async () => {
        const mockData = [
            { StationId: 'A001', Temperature: '25', Humidity: '80' }
        ];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
        });

        const result = await service.getObservations();
        
        expect(mockFetch).toHaveBeenCalledWith('/mock.json');
        expect(result).toEqual(mockData);
    });

    it('should throw an error if response is not ok', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404
        });

        await expect(service.getObservations()).rejects.toThrow('HTTP Error: 404');
    });

    it('should throw an error on network failure', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(service.getObservations()).rejects.toThrow('Network error');
    });
});
