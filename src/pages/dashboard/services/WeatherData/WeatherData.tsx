import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { WeatherForecastModel } from "@models/WeatherForecast";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import { SvgIcon } from '@mui/material';

import NorthIcon from '@mui/icons-material/North';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import WestIcon from '@mui/icons-material/West';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import SouthIcon from '@mui/icons-material/South';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import EastIcon from '@mui/icons-material/East';
import NorthEastIcon from '@mui/icons-material/NorthEast';

interface TimeData {
    ambient_temperature?: number;
    ambient_humidity?: number;
    wind_speed?: number;
    wind_direction?: number;
    precipitation?: number;
}
interface DailyData {
    [time: string]: TimeData;
}
interface FormattedWeatherData {
    [date: string]: DailyData;
}

const WeatherDataPage = () => {

    const { session } = useSession();
    const [loadingFormat, setLoadingFormat] = useState<boolean>(false);

    const { fetchData, loading, response, error } = useFetch<WeatherForecastModel[]>(
        `proxy/weather_data/api/data/forecast5/?lat=${session?.farm_parcel?.location.lat}&lon=${session?.farm_parcel?.location.long}`,
        {
            method: 'GET',
        }
    );

    const [formattedData, setFormattedData] = useState<FormattedWeatherData | null>(null);

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        if (session?.farm_parcel) {
            fetchData();
        }
    }, [session?.farm_parcel])

    useEffect(() => {
        if (response && Array.isArray(response)) {
            setLoadingFormat(true);
            const processedData = response.reduce<FormattedWeatherData>((accumulator, currentItem) => {
                const { timestamp, measurement_type, value } = currentItem;
                const [date, timeWithZ] = timestamp.split('T');
                const time = timeWithZ.replace('Z', '');

                if (!accumulator[date]) { accumulator[date] = {}; }
                if (!accumulator[date][time]) { accumulator[date][time] = {}; }

                accumulator[date][time][measurement_type as keyof TimeData] = value;

                setLoadingFormat(false);
                return accumulator;
            }, {});
            setFormattedData(processedData);
        }
    }, [response])

    useEffect(() => {
        if (error) {
            showSnackbar('error', 'Error loading weather');
        }
    }, [error])

    const degreeConvert = (degree: number) => {
        if (degree > 337.5) return { str: 'N', icon: <NorthIcon /> };
        if (degree > 292.5) return { str: 'NW', icon: <NorthWestIcon /> };
        if (degree > 247.5) return { str: 'W', icon: <WestIcon /> };
        if (degree > 202.5) return { str: 'SW', icon: <SouthWestIcon /> };
        if (degree > 157.5) return { str: 'S', icon: <SouthIcon /> };
        if (degree > 122.5) return { str: 'SE', icon: <SouthEastIcon /> };
        if (degree > 67.5) return { str: 'E', icon: <EastIcon /> };
        if (degree > 22.5) return { str: 'NE', icon: <NorthEastIcon /> };
        return { str: 'N', icon: <NorthIcon /> };
    }

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ContentGuard condition={session?.farm_parcel}>
                {(loading || loadingFormat) && <Skeleton variant="rectangular" height={48} />}
                {!(loading || loadingFormat) &&
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        {formattedData && Object.entries(formattedData).map(([date, dailyData]: [string, DailyData]) => {
                            return <Card key={`id-date-${date}`}>
                                <CardContent>
                                    <Typography gutterBottom variant="h4">{date}</Typography>
                                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                                        {Object.entries(dailyData).sort().map(([time, timeData]: [string, TimeData]) => {
                                            const { str, icon } = degreeConvert(timeData.wind_direction ?? 0);
                                            return <Fragment key={`id-time-${date}-${time}`}>
                                                <Box display={'flex'} flex={1} justifyContent={'space-between'} alignItems={'center'} gap={2}>
                                                    <Box display={'flex'} alignItems={'center'} gap={1} flex={1}>
                                                        <SvgIcon children={<AccessTimeIcon />} />
                                                        {time}
                                                    </Box>
                                                    <Box display={'flex'} alignItems={'center'} gap={1} flex={1}>
                                                        <SvgIcon children={<ThermostatIcon />} />
                                                        {timeData.ambient_temperature}°C
                                                    </Box>
                                                    <Box display={'flex'} alignItems={'center'} gap={1} flex={1}>
                                                        <SvgIcon children={<WaterDropIcon />} />
                                                        {timeData.ambient_humidity}%
                                                    </Box>
                                                    <Box display={'flex'} flexDirection={'column'} alignItems={'center'} flex={1}>
                                                        <Box display={'flex'} alignItems={'center'} gap={1}><SvgIcon children={<AirIcon />} /> {timeData.wind_speed} km/h</Box>
                                                        <Box display={'flex'} alignItems={'center'} gap={1}><SvgIcon children={icon} /> {str}</Box>
                                                    </Box>
                                                </Box>
                                            </Fragment>
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>
                        })}
                    </Box>
                }
            </ContentGuard>
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default WeatherDataPage;