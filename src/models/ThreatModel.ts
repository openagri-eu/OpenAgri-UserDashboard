export interface ThreatModelBioParams {
    t_base?: number;
    pheno_hi?: number;
    pheno_lo?: number;
    min_streak?: number;
    t_lethal_max?: number;
    t_lethal_min?: number;
    pheno_frac_hi?: number;
    pheno_frac_lo?: number;
    t_optimal_max?: number;
    t_optimal_min?: number;
    pheno_frac_ref_gdd5?: number;
}

export interface ThreatModelDefinition {
    bio_params?: ThreatModelBioParams;
    fuzzy_rules?: unknown[];
}

export interface ThreatModel {
    id: string;
    scientific_name: string;
    common_name: string;
    label: string | null;
    note: string | null;
    definition: ThreatModelDefinition;
    crop_id: string;
}
