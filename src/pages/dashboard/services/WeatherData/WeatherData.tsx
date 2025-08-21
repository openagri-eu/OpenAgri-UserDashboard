import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import WeatherData from "@components/dashboard/services/WeatherData/WeatherData";

const WeatherDataPage = () => {
    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <WeatherData></WeatherData>
        </>
    )
}

export default WeatherDataPage;