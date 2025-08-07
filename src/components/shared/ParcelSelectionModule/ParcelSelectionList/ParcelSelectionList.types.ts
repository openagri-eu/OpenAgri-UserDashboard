import { FarmParcel } from "@models/FarmParcel";

export interface ParcelSelectionListProps {
    parcels: FarmParcel[];
    f: (parcel?: FarmParcel) => void;
}