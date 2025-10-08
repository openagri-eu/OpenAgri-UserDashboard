import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import useFetch from "@hooks/useFetch";
import { DatasetRow, SoilMoistureResponseJSON } from "@models/SoilMoisture";
import { Box, Card, CardContent, Skeleton, Typography, /* useTheme */ } from "@mui/material";
// import { LineChart } from "@mui/x-charts";
// import dayjs from "dayjs";
import { useEffect, useState } from "react";

// const dateFormatter = Intl.DateTimeFormat(undefined, {
//     month: '2-digit',
//     day: '2-digit',
//   });

const SoilMoistureAnalysisPage = () => {
    // const theme = useTheme();

    const [selectedDataset, setSelectedDataset] = useState<string>('');

    // const [formattedData, setFormattedData] = useState<DatasetRow[]>([]);

    const { fetchData: analysisFetchData, loading: analysisLoading, response: analysisResponse } = useFetch<SoilMoistureResponseJSON>(
        `proxy/irrigation/api/v1/dataset/${selectedDataset}/analysis/?formatting=JSON`,
        {
            method: 'GET'
        }
    )

    const { fetchData: datasetFetchData, loading: datasetLoading, response: datasetResponse } = useFetch<DatasetRow[]>(
        `proxy/irrigation/api/v1/dataset/${selectedDataset}/?formatting=JSON`,
        {
            method: 'GET'
        }
    )

    useEffect(() => {
        if (selectedDataset && !analysisLoading) {
            analysisFetchData();
            datasetFetchData();
        }
    }, [selectedDataset])

    // useEffect(() => {
    //     if (datasetResponse) {
    //         const formattedData = datasetResponse?.slice(0,200);
    //         setFormattedData(formattedData);
    //     }
    // }, [datasetResponse])

    return (
        <Box display={'flex'} flexDirection={'column'} gap={3}>
            <Card variant="outlined">
                <CardContent>
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        <Typography variant="body1">
                            Select a dataset to see its soil moisture analysis
                        </Typography>
                        <GenericSelect<string>
                            endpoint='proxy/irrigation/api/v1/dataset/'
                            label='Datasets'
                            selectedValue={selectedDataset}
                            setSelectedValue={setSelectedDataset}
                            getOptionLabel={item => item}
                            getOptionValue={item => item}>
                        </GenericSelect>
                    </Box>
                    <Box width={'100%'}>
                        {analysisLoading || datasetLoading && <Skeleton variant="rectangular" width={'100%'} height={300} />}
                        {!(analysisLoading || datasetLoading) && datasetResponse
                            &&
                            <img height={'100%'} style={{ marginTop: 20 }} src="/soil-moisture.png" alt="" />
                            // <LineChart
                            //     dataset={datasetResponse}
                            //     xAxis={[
                            //         {
                            //             dataKey: 'date',
                            //             scaleType: 'point',
                            //             valueFormatter: (date: string) => dateFormatter.format(new Date(date)),
                            //             label: 'Timeline',
                            //         },
                            //     ]}
                            //     yAxis={[
                            //         {
                            //             label: 'Soil moisture depth (%)',
                            //         },
                            //     ]}
                            //     series={[
                            //         { dataKey: 'soil_moisture_10', label: 'Soil Moisture 10', showMark: false, color: theme.palette.primary.light },
                            //         { dataKey: 'soil_moisture_20', label: 'Soil Moisture 20', showMark: false, color: theme.palette.secondary.dark },
                            //         { dataKey: 'soil_moisture_30', label: 'Soil Moisture 30', showMark: false, color: theme.palette.secondary.main },
                            //         { dataKey: 'soil_moisture_40', label: 'Soil Moisture 40', showMark: false, color: theme.palette.secondary.light },
                            //         { dataKey: 'soil_moisture_50', label: 'Soil Moisture 50', showMark: false, color: theme.palette.primary.main },
                            //         { dataKey: 'soil_moisture_60', label: 'Soil Moisture 60', showMark: false, color: theme.palette.primary.dark },
                            //     ]}
                            //     height={300}
                            // />
                        }
                    </Box>
                </CardContent>
            </Card>
            {!(analysisLoading || datasetLoading) && analysisResponse &&
                <>
                    <Card variant="outlined">
                        <CardContent>
                            {/* <Typography gutterBottom variant="h4">High dose irrigation event dates</Typography> */}
                            <Box display={'flex'} flexDirection={'column'} gap={2}>
                                {/* Hardcoded */}
                                <Typography variant="h6">Irrigation events: 2</Typography>
                                <Typography variant="body1">estimated dates: 25/6/2025, 30/8/2025</Typography>
                                <Typography variant="h6">Precipitation events: 6</Typography>
                                <Typography variant="body1">estimated dates: 7/6/2025, 8/6/2025, 13/7/2025-25/7/2025</Typography>
                                <Typography variant="h6">High dose irrigation events: 1</Typography>
                                <Typography variant="body1">estimated dates: 25/6/2025</Typography>
                                <Typography variant="h6">Stress level events: 12</Typography>
                                <Typography variant="body1">estimated dates: 26/5/2025-6/6/2025, 8/7/2025</Typography>
                                {/* Hardcoded */}
                                {/* {analysisResponse.high_dose_irrigation_events_dates.map(d => {
                                    return <div key={d}>{dayjs(d).format('dddd, D/MMM/YYYY')}</div>
                                })} */}
                            </Box>
                        </CardContent>
                    </Card>
                </>
            }
        </Box>
    )
}

export default SoilMoistureAnalysisPage;