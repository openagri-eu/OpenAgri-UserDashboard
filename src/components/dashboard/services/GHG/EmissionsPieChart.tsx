import { useEffect, useMemo, useState } from 'react';
import { Chart } from '@highcharts/react';
import * as Highcharts from 'highcharts';
import { Box, Skeleton, Typography } from '@mui/material';

type Observation = Record<string, any>;

const fakeObservations: Observation[] = [
  { type: 'Fertilizers', value: 42 },
  { type: 'Fuel', value: 28 },
  { type: 'Livestock', value: 18 },
  { type: 'Residues', value: 7 },
  { type: 'Irrigation', value: 5 },
];

const EmissionsPieChart = ({ groupingField = 'type' }: { groupingField?: string }) => {
  const [response, setResponse] = useState<Observation[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResponse(fakeObservations);
      setLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    if (!response) return null;

    let observations: Observation[] = [];
    if (Array.isArray(response)) observations = response as Observation[];
    // else if (response.results) observations = response.results as Observation[];
    // else if (response.data) observations = response.data as Observation[];
    // else if (response.observations) observations = response.observations as Observation[];

    const sums: Record<string, number> = {};
    observations.forEach((o) => {
      const key = o[groupingField] ?? 'Unknown';
      const value = Number(o.value ?? o.amount ?? 0) || 0;
      sums[key] = (sums[key] || 0) + value;
    });

    const entries = Object.entries(sums).sort((a, b) => b[1] - a[1]);
    const top3 = entries.slice(0, 3);
    if (top3.length === 0) return { data: [] };

    const total = top3.reduce((s, [_k, v]) => s + v, 0) || 1;

    const data = top3.map(([k, v]) => ({ name: k, y: v }));
    return { data, total };
  }, [response, groupingField]);

  if (loading) return <Skeleton variant="rectangular" width="100%" height={300} />;

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

  return (
    <Box>
      <Chart options={options} highcharts={Highcharts} />
    </Box>
  );
};

export default EmissionsPieChart;
