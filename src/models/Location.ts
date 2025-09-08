export interface Location {
    id: number,
    latitude: number,
    longitude: number,
    city_name: string | null,
    state_code: string | null,
    country_code: string | null
}

export interface LocationResponse {
    locations: Location[]
}