import { PestModel } from "@models/Pest";

export interface PestCRUDActionsProps {
    pest?: PestModel;
    onAction?: () => void
}