export interface UAVFlightForecastModel {
    weather_source: string;
    status: string;
    timestamp: string;
    uav_model: string;
    location: {
        type: string;
        coordinates: number[];
    };
    weather_params: {
        temp: number;
        precipitation: number;
        rain: number;
        wind: number;
    }
}