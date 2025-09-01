import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { WeatherForecastModel } from "@models/WeatherForecast";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";

import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import { SvgIcon } from '@mui/material';

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
        if (degree > 337.5) return 'N';
        if (degree > 292.5) return 'NW';
        if (degree > 247.5) return 'W';
        if (degree > 202.5) return 'SW';
        if (degree > 157.5) return 'S';
        if (degree > 122.5) return 'SE';
        if (degree > 67.5) return 'E';
        if (degree > 22.5) return 'NE';
        return 'N';
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
                                            return <Fragment key={`id-time-${date}-${time}`}>
                                                <Box display={'flex'} flex={1} justifyContent={'space-between'} alignItems={'center'} gap={2}>
                                                    <Box flex={1}>{time}</Box>
                                                    <Box display={'flex'} alignItems={'center'} flex={1}>
                                                        <SvgIcon children={<ThermostatIcon />} />
                                                        {timeData.ambient_temperature}°C
                                                    </Box>
                                                    <Box display={'flex'} alignItems={'center'} flex={1}>
                                                        <SvgIcon children={<WaterDropIcon />} />
                                                        {timeData.ambient_humidity}%
                                                    </Box>
                                                    <Box display={'flex'} alignItems={'center'} flex={1}>
                                                        <SvgIcon children={<AirIcon />} /> {timeData.wind_speed} km/h {degreeConvert(timeData.wind_direction ?? 0)}
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