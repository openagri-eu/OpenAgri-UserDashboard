export interface SoilMoistureRequest {
    dataset_id: string;
    date: string;
    soil_moisture_10: number;
    soil_moisture_20: number;
    soil_moisture_30: number;
    soil_moisture_40: number;
    soil_moisture_50: number;
    soil_moisture_60: number;
    rain: number;
    temperature: number;
    humidity: number;
};

export interface SoilMoistureResponse {
    '@context': string[];
    '@graph': SoilMoistureGraphEntry[];
};

interface SoilMoistureGraphEntry {
    '@id': string;
    '@type': string;
    'description': string;
    'duringPeriod': {
        '@id': string;
        '@type': string;
        'hasBeginning': {
            '@id': string;
            '@type': string;
            'inXSDDateTime': string;
        };
        'hasEnd': {
            '@id': string;
            '@type': string;
            'inXSDDateTime': string;
        };
    };
    'irrigationAnalysis': {
        '@id': string;
        '@type': string;
        'hasHighDoseIrrigationOperationDates': any; // TODO: proper model
        'numberOfHighDoseIrrigationOperations': number;
        'numberOfIrrigationOperations': number;
    };
    'numberOfPrecipitationEvents': number;
    'saturationAnalysis': {
        '@id': string;
        '@type': string;
        'hasFieldCapacities': any // TODO: proper model
        'hasSaturationDates': any // TODO: proper model
        'numberOfSaturationDays': number;
    };
    'stressAnalysis': {
        '@id': string;
        '@type': string;
        'numberOfStressDays': number;
        'hasStressDates': string[][];
        'hasStressLevels': {
            '@id': string;
            '@type': string;
            'numericValue': number;
            'unit': string;
            'atDepth': {
                '@id': string;
                '@type': string;
                'hasNumericValue': string;
                'hasUnit': string;
            };
        }[][];
    };
}