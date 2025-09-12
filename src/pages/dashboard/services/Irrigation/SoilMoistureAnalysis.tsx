import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import useFetch from "@hooks/useFetch";
import { SoilMoistureResponseJSON } from "@models/SoilMoisture";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { colors } from "@theme/colors";
import { useEffect, useState } from "react";

const SoilMoistureAnalysisPage = () => {
    const [selectedDataset, setSelectedDataset] = useState<string>('');

    const { fetchData, loading, response } = useFetch<SoilMoistureResponseJSON>(
        `proxy/irrigation/api/v1/dataset/${selectedDataset}/analysis/?formatting=JSON`,
        {
            method: 'GET'
        }
    )

    useEffect(() => {
        if (selectedDataset && !loading) {
            fetchData();
        }
    }, [selectedDataset])

    useEffect(() => {
        if (response) {
            console.log(response);

        }
    }, [response])

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
                        {loading && <Skeleton variant="rectangular" width={'100%'} height={300} />}
                        {response
                            && <BarChart
                                hideLegend={true}
                                xAxis={[
                                    {
                                        id: 'barCategories',
                                        data: response.high_dose_irrigation_events_dates,
                                        label: 'Stress Depth',
                                        scaleType: 'band'
                                    },
                                ]}
                                series={[
                                    {
                                        data: Array(response.high_dose_irrigation_events_dates.length).fill(1),
                                        label: '',
                                    },
                                ]}
                                colors={[colors.primary.main]}
                                sx={{ width: '100%' }}
                                height={300}
                            />
                        }
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}

export default SoilMoistureAnalysisPage;