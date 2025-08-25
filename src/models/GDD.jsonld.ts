export interface GDDModel {
    '@context': string[];
    '@graph': ObservationCollection[][];
}

interface ObservationCollection {
    '@id': string;
    '@type': string;
    description: string;
    observedProperty: ObservedProperty;
    hasFeatureOfInterest: FeatureOfInterest;
    hasMember: Observation[];
}

interface FeatureOfInterest {
    '@id': string;
    '@type': string[];
    name: string;
    description: string;
    eppoConcept: string;
    hasBaseGrowingDegree: string;
}

interface Observation {
    '@id': string;
    '@type': string;
    phenomenonTime: string; // ISO date string
    hasResult: QuantityValue;
    descriptor: string;
}

interface QuantityValue {
    '@id': string;
    '@type': string;
    hasValue: string; // Could be parsed to number
    unit: string;
}

interface ObservedProperty {
    '@id': string;
    '@type': string[];
}