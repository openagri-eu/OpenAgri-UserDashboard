import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import { Typography } from "@mui/material";

const IrrigationPage = () => {
    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <Typography variant="body1">Irrigation management page!</Typography>
        </>
    )
}

export default IrrigationPage;