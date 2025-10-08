export interface GDDModel {
    models: Model[]
}

interface Model {
    name: string;
    eppo_code: string;
    base_gdd: number;
    description: string;
    gdd_points: GddPoint[];
    gdd_values: GddValue[];
}

interface GddPoint {
    id: number;
    start: number;
    end: number;
    descriptor: string;
}

interface GddValue {
    date: string;
    gdd_value: number;
    accumulated_gdd: number;
    descriptor: string;
}