import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import FarmCalendar from "@components/dashboard/services/FarmCalendar/FarmCalendar";

const FarmCalendarPage = () => {
    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <FarmCalendar></FarmCalendar>
        </>
    )
}

export default FarmCalendarPage;