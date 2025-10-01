export type SprayStatus = 'unsuitable' | 'marginal' | 'optimal';

export interface SprayForecastModel {
    source: string;
    timestamp: string;
    location: {
        type: string;
        coordinates: number[];
    };
    spray_conditions: SprayStatus;
    detailed_status: {
        temperature_status: SprayStatus;
        wind_status: SprayStatus;
        precipitation_status: SprayStatus;
        humidity_status: SprayStatus;
        delta_t_status: SprayStatus;
    };
}