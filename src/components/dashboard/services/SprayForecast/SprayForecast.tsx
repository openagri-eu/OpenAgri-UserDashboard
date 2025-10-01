import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { SprayForecastModel, SprayStatus } from "@models/SprayForecast";
import { Box, Card, CardContent, Chip, Skeleton, SvgIcon, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Fragment, useEffect, useState } from "react";

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ChipProps } from '@mui/material/Chip';

interface TimeData {
    spray_conditions?: SprayStatus;
    detailed_status?: {
        delta_t_status: SprayStatus;
        humidity_status: SprayStatus;
        precipitation_status: SprayStatus;
        temperature_status: SprayStatus;
        wind_status: SprayStatus;
    };
}
interface DailyData {
    [time: string]: TimeData;
}
interface FormattedSprayData {
    [date: string]: DailyData;
}

const getStatusColor = (status?: SprayStatus): ChipProps['color'] => {
    switch (status) {
        case 'optimal':
            return 'success';
        case 'marginal':
            return 'warning';
        case 'unsuitable':
            return 'error';
        default:
            return 'default';
    }
};

const SprayForecast = () => {
    const { session } = useSession();
    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();
    const [formattedData, setFormattedData] = useState<FormattedSprayData | null>(null);
    const { fetchData: sprayFetchData, loading: sprayLoading, response: sprayResponse, error: sprayError } = useFetch<SprayForecastModel[]>(
        `proxy/weather_data/api/data/spray-forecast/?lat=${session?.farm_parcel?.location.lat}&lon=${session?.farm_parcel?.location.long}`,
        { method: 'GET' }
    );
    const [loadingFormat, setLoadingFormat] = useState<boolean>(false);

    useEffect(() => {
        if (session?.farm_parcel) {
            sprayFetchData();
        }
    }, [session?.farm_parcel]);

    useEffect(() => {
        if (sprayError) {
            showSnackbar('error', 'Error loading spray forecast');
        }
    }, [sprayError]);

    useEffect(() => {
        if (sprayResponse && Array.isArray(sprayResponse)) {
            setLoadingFormat(true);
            const processedData = sprayResponse.reduce<FormattedSprayData>((accumulator, currentItem) => {
                const { timestamp, spray_conditions, detailed_status } = currentItem;
                const [date, timeWithZ] = timestamp.split('T');
                const time = timeWithZ.replace('Z', '');
                if (!accumulator[date]) { accumulator[date] = {}; }
                if (!accumulator[date][time]) { accumulator[date][time] = {}; }
                accumulator[date][time].spray_conditions = spray_conditions;
                accumulator[date][time].detailed_status = detailed_status;
                return accumulator;
            }, {});
            setFormattedData(processedData);
            setLoadingFormat(false);
        }
    }, [sprayResponse]);


    return (
        <>
            <ContentGuard condition={session?.farm_parcel}>
                {(sprayLoading || loadingFormat) && <Skeleton variant="rectangular" height={48} />}
                {!(sprayLoading || loadingFormat) &&
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        {formattedData && Object.entries(formattedData).map(([date, dailyData]: [string, DailyData]) => {
                            return <Card key={`id-date-${date}`}>
                                <CardContent>
                                    <Typography gutterBottom variant="h4">{dayjs(date).format('dddd, D/MMM/YYYY')}</Typography>
                                    {/* Added sx prop for better responsive behavior */}
                                    <Box display={'flex'} flexDirection={'column'} gap={2} sx={{ overflowX: 'auto', py: 1 }}>
                                        {Object.entries(dailyData).sort().map(([time, timeData]: [string, TimeData]) => {
                                            return <Fragment key={`id-time-${date}-${time}`}>
                                                <Box display={'flex'} flex={1} justifyContent={'space-between'} alignItems={'center'} gap={2} sx={{ minWidth: 800 }}>
                                                    <Box display={'flex'} alignItems={'center'} gap={1} flex={1}>
                                                        <SvgIcon children={<AccessTimeIcon />} />
                                                        {dayjs(`${date} ${time}`).format('HH:mm')}
                                                    </Box>
                                                    <Box display={'flex'} flex={1} justifyContent={'center'}>
                                                        <Chip label="Overall" color={getStatusColor(timeData.spray_conditions)} />
                                                    </Box>
                                                    <Box display={'flex'} flex={1} justifyContent={'center'}>
                                                        <Chip label="Delta T" color={getStatusColor(timeData.detailed_status?.delta_t_status)} />
                                                    </Box>
                                                    <Box display={'flex'} flex={1} justifyContent={'center'}>
                                                        <Chip label="Humidity" color={getStatusColor(timeData.detailed_status?.humidity_status)} />
                                                    </Box>
                                                    <Box display={'flex'} flex={1} justifyContent={'center'}>
                                                        <Chip label="Precipitation" color={getStatusColor(timeData.detailed_status?.precipitation_status)} />
                                                    </Box>
                                                    <Box display={'flex'} flex={1} justifyContent={'center'}>
                                                        <Chip label="Temperature" color={getStatusColor(timeData.detailed_status?.temperature_status)} />
                                                    </Box>
                                                    <Box display={'flex'} flex={1} justifyContent={'center'}>
                                                        <Chip label="Wind" color={getStatusColor(timeData.detailed_status?.wind_status)} />
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

export default SprayForecast;