export interface WeatherForecastModel {
    data_type: string;
    measurement_type: string;
    source: string;
    timestamp: string;
    value: number;
    spatial_entity: {
        location: {
            type: string;
            coordinates: number[];
        };
    };
}