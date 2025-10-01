import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";

import ImageButtonGrid from "@components/shared/styled/ImageButtonGrid";
import WeatherForecast from "@components/dashboard/services/WeatherForecast/WeatherForecast";
import SprayForecast from "@components/dashboard/services/SprayForecast/SprayForecast";
import UAVFlightsForecast from "@components/dashboard/services/UAVFlightsForecast/UAVFlightsForecast";


function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
    return (
        <div hidden={value !== index}>
            {value === index && (
                <Box sx={{ marginTop: 4 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const WeatherDataPage = () => {

    const [tab, setTab] = useState(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Weather forecast" />
                <Tab label="Spray forecast" />
                <Tab label="UAV flights forecast" />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <WeatherForecast />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <SprayForecast />
            </TabPanel>
            <TabPanel value={tab} index={2}>
                <UAVFlightsForecast />
            </TabPanel>
            <ImageButtonGrid />
        </>
    )
}

export default WeatherDataPage;