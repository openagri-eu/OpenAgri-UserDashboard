export interface EToCalculation {
    '@context': string[];
    '@graph': ETOGraphEntry[];
}

interface ETOGraphEntry {
    '@id': string;
    '@type': string;
    'description': string;
    'resultTime': string;
    'observerdProperty': {
        '@id': string;
        '@type': string[];
    };
    'hasFeatureOfInterest': {
        '@id': string;
        '@type': string[]
    };
    'hasSimpleResult': number;
}