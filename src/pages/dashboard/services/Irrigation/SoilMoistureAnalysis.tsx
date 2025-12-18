import { useMemo, useState, useEffect } from 'react';
import * as Highcharts from 'highcharts';
import { Chart, XAxis, YAxis, Tooltip, Legend } from '@highcharts/react';
import { Line } from '@highcharts/react/series';

import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import useFetch from "@hooks/useFetch";
import { DatasetResponse, DatasetRow } from "@models/SoilMoisture"; 
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";

const SoilMoistureAnalysisPage = () => {
    const [selectedDataset, setSelectedDataset] = useState<string>('');

    const { fetchData: datapointsFetchData, loading: datapointsLoading, response: datapointsResponse } = useFetch<DatasetResponse>(
        `proxy/irrigation/api/v1/dataset/${selectedDataset}/irrigation-datapoints/?formatting=JSON`,
        {
            method: 'GET'
        }
    )

    useEffect(() => {
        if (selectedDataset) {
            datapointsFetchData();
        }
    }, [selectedDataset])

    const { seriesData, plotLinesData } = useMemo(() => {
        if (!datapointsResponse || datapointsResponse.data_points.length === 0) {
            return { seriesData: [], plotLinesData: [] };
        }

        const { data_points, high_dose_irrigation_days } = datapointsResponse;
        
        const soilMoistureKeys = ['soil_moisture_10', 'soil_moisture_20', 'soil_moisture_30', 'soil_moisture_40', 'soil_moisture_50', 'soil_moisture_60'];
        
        const preparedSeriesData = soilMoistureKeys.map(key => {
            const depth = key.split('_')[2];
            
            const data = data_points
                .map(d => {
                    const timestamp = dayjs(d.date).valueOf();
                    const value = d[key as keyof DatasetRow] as number; 
                    return [timestamp, value] as [number, number];
                })
                .filter(([_ts, val]) => val !== 0) as [number, number][];

            return {
                name: `Soil Moisture ${depth}cm`,
                data: data,
                key: key,
            };
        });

        const preparedPlotLinesData = high_dose_irrigation_days.map((dateStr, index) => {
            const timestamp = dayjs(dateStr).valueOf();
            
            const plotLineProps: Highcharts.XAxisPlotLinesOptions = {
                value: timestamp,
                color: '#FF0000',
                dashStyle: 'Solid',
                width: 2,
                zIndex: 5,
                label: index === 0 ? {
                    text: 'High Dose Irrigation',
                    rotation: 90,
                    align: 'left',
                    textAlign: 'center',
                    verticalAlign: 'top',
                    style: {
                        color: '#FF0000',
                        fontWeight: 'bold',
                    },
                    x: 5
                } : undefined
            };
            return plotLineProps;
        });

        return { seriesData: preparedSeriesData, plotLinesData: preparedPlotLinesData };

    }, [datapointsResponse]);


    const chartReady = !datapointsLoading && datapointsResponse && seriesData.length > 0;

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
                        {datapointsLoading && <Skeleton variant="rectangular" width={'100%'} height={400} />}
                        
                        {chartReady && (
                            <Chart 
                                title='Soil Moisture Analysis and Irrigation Events'
                            >
                                <XAxis
                                    type="datetime"
                                    title={{ text: 'Date' }}
                                    dateTimeLabelFormats={{}}
                                >
                                    {plotLinesData.map((plotLineProps, index) => (
                                        <XAxis 
                                        key={index} 
                                        width={plotLineProps.width}
                                        zIndex={plotLineProps.zIndex}
                                    />
                                    ))}
                                </XAxis>
                                
                                <YAxis title={{ text: 'Soil Moisture (%)' }} />
                                
                                <Tooltip 
                                    shared={true} 
                                    xDateFormat='%Y-%m-%d' 
                                    valueSuffix='%' 
                                />
                                
                                <Legend />

                                {seriesData.map(series => (
                                    <Line.Series 
                                        key={series.key}
                                        data={series.data} 
                                    />
                                ))}
                            </Chart>
                        )}
                        
                        {!datapointsLoading && !datapointsResponse && (
                             <Typography variant="caption" color="text.secondary" p={2}>
                                Please select a dataset to load soil moisture readings.
                             </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>

        </Box>
    )
}

export default SoilMoistureAnalysisPage;