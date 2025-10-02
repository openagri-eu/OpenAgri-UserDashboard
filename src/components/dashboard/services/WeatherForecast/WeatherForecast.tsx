import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { WeatherForecastModel } from "@models/WeatherForecast";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SunnyIcon from '@mui/icons-material/Sunny';
import CloudySnowingIcon from '@mui/icons-material/CloudySnowing';
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
import dayjs from "dayjs";

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

const WeatherForecast = () => {
    const { session } = useSession();
    const [loadingFormat, setLoadingFormat] = useState<boolean>(false);

    const [formattedData, setFormattedData] = useState<FormattedWeatherData | null>(null);

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();


    const { fetchData: forecastFetchData, loading: forecastLoading, response: forecastResponse, error: forecastError } = useFetch<WeatherForecastModel[]>(
        `proxy/weather_data/api/data/forecast5/?lat=${session?.farm_parcel?.location.lat}&lon=${session?.farm_parcel?.location.long}`,
        {
            method: 'GET',
        }
    );

    useEffect(() => {
        if (session?.farm_parcel) {
            forecastFetchData();
        }
    }, [session?.farm_parcel])

    useEffect(() => {
        if (forecastError) {
            showSnackbar('error', 'Error loading weather');
            setFormattedData(null);
        }
    }, [forecastError])

    useEffect(() => {
        if (forecastResponse && Array.isArray(forecastResponse)) {
            setLoadingFormat(true);
            const processedData = forecastResponse.reduce<FormattedWeatherData>((accumulator, currentItem) => {
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
    }, [forecastResponse])

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

    const precipitationConvert = (precipitation: number) => {
        const percentage = precipitation * 100;
        if (precipitation > 0) return { percentage: percentage, icon: <CloudySnowingIcon /> };
        return { percentage: percentage, icon: <SunnyIcon /> };
    }

    return (
        <>
            <ContentGuard condition={session?.farm_parcel}>
                {(forecastLoading || loadingFormat) && <Skeleton variant="rectangular" height={48} />}
                {!(forecastLoading || loadingFormat) &&
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        {formattedData && Object.entries(formattedData).map(([date, dailyData]: [string, DailyData]) => {
                            return <Card key={`id-date-${date}`}>
                                <CardContent>
                                    <Typography gutterBottom variant="h4">{dayjs(date).format('dddd, D/MMM/YYYY')}</Typography>
                                    <Box display={'flex'} flexDirection={'column'} gap={2} overflow={'auto'}>
                                        {Object.entries(dailyData).sort().map(([time, timeData]: [string, TimeData]) => {
                                            const { str: strWind, icon: iconWind } = degreeConvert(timeData.wind_direction ?? 0);
                                            const { percentage, icon: iconPrec } = precipitationConvert(timeData.precipitation ?? 0);
                                            return <Fragment key={`id-time-${date}-${time}`}>
                                                <Box display={'flex'} flex={1} justifyContent={'space-between'} alignItems={'center'} gap={2}>
                                                    <Box display={'flex'} alignItems={'center'} gap={1} flex={1} minWidth={72}>
                                                        <SvgIcon children={<AccessTimeIcon />} />
                                                        {dayjs(`${date} ${time}`).format('HH:mm')}
                                                    </Box>
                                                    <Box display={'flex'} alignItems={'center'} gap={1} flex={1} minWidth={100}>
                                                        <SvgIcon children={<ThermostatIcon />} />
                                                        {timeData.ambient_temperature}°C
                                                    </Box>
                                                    <Box display={'flex'} alignItems={'center'} gap={1} flex={0.5} minWidth={72}>
                                                        <SvgIcon children={<WaterDropIcon />} />
                                                        {timeData.ambient_humidity}%
                                                    </Box>
                                                    <Box display={'flex'} alignItems={'center'} gap={1} justifyContent={'center'} flex={1} minWidth={72}>
                                                        <Box display={'flex'} flexDirection={'column'}  alignItems={'center'}>
                                                            <SvgIcon children={iconPrec} />
                                                            {percentage ? percentage + "%": <></>}
                                                        </Box>
                                                    </Box>
                                                    <Box display={'flex'} flexDirection={'column'} alignItems={'center'} flex={1} minWidth={144}>
                                                        <Box display={'flex'} alignItems={'center'} gap={1}><SvgIcon children={<AirIcon />} /> {timeData.wind_speed} km/h</Box>
                                                        <Box display={'flex'} alignItems={'center'} gap={1}><SvgIcon children={iconWind} /> {strWind}</Box>
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

export default WeatherForecast;
