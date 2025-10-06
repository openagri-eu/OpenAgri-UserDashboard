export type RiskIndexStatus = 'low' | 'high';

export interface RiskIndexModel {
    '@context': string[];
    '@graph': ObservationCollection[];
}

interface ObservationCollection {
    '@id': string;
    '@type': string[];
    description: string;
    observedProperty: ObservedProperty;
    madeBySensor: MadeBySensor;
    hasFeatureOfInterest: FeatureOfInterest;
    basedOnWeatherDataset: BasedOnWeatherDataset;
    resultTime: string;
    hasMember: Observation[];
}

interface ObservedProperty {
    '@id': string;
    '@type': string[];
    name: string;
    hasAgriPest: AgriPest;
}

interface AgriPest {
    '@id': string;
    '@type': string;
    name: string;
    description: string;
    eppoConcept: string;
}

interface MadeBySensor {
    '@id': string;
    '@type': string[];
    name: string;
}

interface FeatureOfInterest {
    '@id': string;
    '@type': string[];
    long: string;
    lat: string;
}

interface BasedOnWeatherDataset {
    '@id': string;
    '@type': string;
    name: string;
}

interface Observation {
    '@id': string;
    '@type': string[];
    phenomenonTime: string;
    hasSimpleResult: RiskIndexStatus;
}