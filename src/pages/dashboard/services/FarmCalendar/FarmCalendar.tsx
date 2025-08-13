import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import FarmParcels from "@components/dashboard/services/FarmCalendar/FarmParcels";

const FarmCalendarPage = () => {
    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <FarmParcels></FarmParcels>
        </>
    )
}

export default FarmCalendarPage;