export interface FarmAnimalModel {
    '@type': 'Animal';
    '@id': string;
    nationalID: string;
    name: string;
    description: string;
    hasAgriParcel: {
        '@type': 'Parcel';
        '@id': string;
    };
    sex: number;
    isCastrated: boolean;
    species: string;
    breed: string;
    birthdate: string;
    isMemberOfAnimalGroup: {
        '@id': string;
        '@type': 'AnimalGroup';
        hasName: string;
    };
    status: number;
    invalidatedAtTime: string | null;
    dateCreated: string;
    dateModified: string;
}