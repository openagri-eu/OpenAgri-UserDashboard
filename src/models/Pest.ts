export interface PestModel {
    id: string
    name: string
    eppo_code: string,
    base_gdd: number,
    description: string,
    gdd_points: { id: number, start: number, end: number, descriptor: string }[]
}

export interface PestsResponseModel {
    diseases: PestModel[] // TODO: change when it's changed on backend
}