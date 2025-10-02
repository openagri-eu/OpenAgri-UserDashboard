export interface DiseaseModel {
    id: string;
    name: string;
    description: string;
    geo_areas_of_application: string;
}

export interface DiseasesResponseModel {
    pests: DiseaseModel[] // TODO: change when it's changed on backend
}