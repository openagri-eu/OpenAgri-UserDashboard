import { FarmParcel } from "@models/FarmParcel";

export interface ParcelSelectionListProps {
    parcels: FarmParcel[];
    selectedParcelId?: string;
    f: (parcel?: FarmParcel) => void;
}