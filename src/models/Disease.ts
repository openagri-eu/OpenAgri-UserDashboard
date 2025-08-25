export interface DiseaseModel {
    id: string
    name: string
    eppo_code: string,
    base_gdd: number,
    description: string,
    gdd_points: { id: string, start: number, end: number, desciptor: string }[]
}

export interface DiseasesResponseModel {
    diseases: DiseaseModel[]
}