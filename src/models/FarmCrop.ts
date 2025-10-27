export interface FarmCropModel {
    '@id': string;
    '@type': string;
    cropSpecies: {
        "@id": string;
        "@type": string;
        "name": string;
        "variety": string;
    };
    status: number;
    invalidatedAtTime: string;
    dateCreated: string;
    dateModified: string;
    name: string;
    description: string;
    hasAgriParcel: {
        "@id": string;
        "@type": string;
    };
    growth_stage: string;
}