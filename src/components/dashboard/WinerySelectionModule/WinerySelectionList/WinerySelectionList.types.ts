import { FarmParcelModel } from "@models/FarmParcel";

export interface WinerySelectionListProps {
    wineries: FarmParcelModel[];
    selectedWineryId?: string;
    f: (winery?: FarmParcelModel) => void;
    farmNamesById?: Record<string, string>;
}
