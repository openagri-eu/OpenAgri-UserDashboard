import { ParcelSelectionEntryProps } from "./ParcelSelectionEntry.types";

const ParcelSelectionEntry: React.FC<ParcelSelectionEntryProps> = ({ parcel, f }) => {
    
    return <div key={parcel["@id"]} onClick={() => f(parcel)}>{parcel.identifier}</div>
};

export default ParcelSelectionEntry