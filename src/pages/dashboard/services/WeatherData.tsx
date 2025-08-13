import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import { Typography } from "@mui/material";

const WeatherDataPage = () => {
    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <Typography variant="body1">Weather data page!</Typography>
        </>
    )
}

export default WeatherDataPage;