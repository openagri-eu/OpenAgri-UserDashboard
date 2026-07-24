import { useEffect, useMemo } from 'react';
import { Chart } from '@highcharts/react';
import * as Highcharts from 'highcharts';
import useFetch from '@hooks/useFetch';
import { Box, Skeleton, Typography } from '@mui/material';

type Observation = Record<string, any>;

interface EmissionsPieChartProps {
  groupingField?: string;
  observations?: Observation[];
}

const EmissionsPieChart = ({ groupingField = 'title', observations: externalObservations }: EmissionsPieChartProps) => {
  const { fetchData, response, loading } = useFetch<any>('proxy/farmcalendar/api/v1/Observations/?format=json');

  // If observations are provided externally, don't fetch
  const shouldFetch = !externalObservations;

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
    }
  }, [shouldFetch]);

  const chartData = useMemo(() => {
    let observations: Observation[] = [];

    // Use external observations if provided, otherwise use fetched response
    if (externalObservations) {
      observations = externalObservations;
    } else if (!response) {
      return null;
    } else {
      if (Array.isArray(response)) observations = response as Observation[];
      else if (response.results) observations = response.results as Observation[];
      else if (response.data) observations = response.data as Observation[];
      else if (response.observations) observations = response.observations as Observation[];
    }

    console.log('EmissionsPieChart: observations =', observations);

    const sums: Record<string, number> = {};
    observations.forEach((o) => {
      const key = o[groupingField] ?? 'Unknown';
      // Support both normalized data (ghgValue) and raw observations (hasResult.hasValue)
      const value = o.ghgValue ?? (Number(o.hasResult?.hasValue ?? 0) || 0);
      sums[key] = (sums[key] || 0) + value;
    });

    const entries = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    const top3 = entries.slice(0, 3);
    if (top3.length === 0) return { data: [] };

    const total = top3.reduce((s, [_k, v]) => s + v, 0) || 1;

    const data = top3.map(([k, v]) => ({ name: k, y: v }));
    console.log('EmissionsPieChart: chartData =', { data, total });
    return { data, total };
  }, [response, groupingField, externalObservations]);

  const isLoading = shouldFetch && loading;
  if (isLoading) return <Skeleton variant="rectangular" width="100%" height={300} />;

  if (!chartData || chartData.data.length === 0) return <Typography variant="caption" color="text.secondary">No GHG observations available.</Typography>;

  const options: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: '' },
    tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    series: [
      {
        type: 'pie',
        name: 'GHG share',
        data: chartData.data
      }
    ]
  };

  console.log('EmissionsPieChart: rendering chart with options =', options);

  return (
    <Box>
      {/* <Chart options={options} highcharts={Highcharts} /> */}
      <Chart options={options} highcharts={{ ...Highcharts }} />
    </Box>
  );
};

export default EmissionsPieChart;
