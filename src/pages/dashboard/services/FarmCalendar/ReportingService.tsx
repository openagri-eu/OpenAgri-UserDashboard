import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import ReportingService from "@components/dashboard/services/FarmCalendar/ReportingService";

const ReportingServicePage = () => {
    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ReportingService></ReportingService>
        </>
    )
}

export default ReportingServicePage;