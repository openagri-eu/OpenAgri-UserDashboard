import { FarmParcel } from "@models/FarmParcel";

export interface ParcelSelectionEntryProps {
    parcel: FarmParcel;
    f: (parcel?: FarmParcel) => void;
}