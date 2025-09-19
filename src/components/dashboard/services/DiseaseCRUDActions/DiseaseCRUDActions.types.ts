import { DiseaseModel } from "@models/Disease";

export interface DiseaseActionsCRUDProps {
    disease?: DiseaseModel;
    onAction?: () => void
}