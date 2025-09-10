import DateRangeSelect from "@components/shared/DateRangeSelect/DateRangeSelect";
// import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { EToCalculation } from "@models/EToCalculation";
// import { Location, LocationResponse } from "@models/Location";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

import { LineChart } from "@mui/x-charts";

import CalculateIcon from '@mui/icons-material/Calculate';
import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import { useSession } from "@contexts/SessionContext";


const EToCalculatorPage = () => {

    const { session } = useSession();

    // const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs().subtract(14, 'days'));
    const [toDate, setToDate] = useState<Dayjs | null>(dayjs());
    const [calculations, setSetCalculations] = useState<EToCalculation | undefined>(undefined);

    const [chartData, setChartData] = useState<
        { x: Date; y: number; }[] | undefined>(undefined);


    const { fetchData, response, error, loading } = useFetch<EToCalculation>(
        `proxy/irrigation/api/v1/eto/calculate-gk/?parcel_id=${session?.farm_parcel?.["@id"].split(":")[3]}&from_date=${fromDate?.format('YYYY-MM-DD')}&to_date=${toDate?.format('YYYY-MM-DD')}&formatting=JSON`,
        // `proxy/irrigation/api/v1/eto/get-calculations/${selectedLocation}/from/${fromDate?.format('YYYY-MM-DD')}/to/${toDate?.format('YYYY-MM-DD')}/?response_format=JSON-LD/`,
        {
            method: 'GET',
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    const handleSubmit = () => {
        fetchData()
    }

    useEffect(() => {
        if (response) {
            showSnackbar('success', "Successfully fetched calculations!");
            setSetCalculations(response);
        }
    }, [response])

    useEffect(() => {
        if (error) {
            showSnackbar('error', error?.message.toString() ?? '');
        }
    }, [error])

    useEffect(() => {
        if (Array.isArray(calculations?.calculations) && calculations.calculations.length > 0) {
            const chartData = calculations.calculations.map((calc) => ({
                x: new Date(calc.date),
                y: calc.value,
            }));
            setChartData(chartData);
        }
    }, [calculations])  

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <Card variant="outlined">
                <CardContent>
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        <Typography variant="body1">
                            Select a location and a time frame to view its ETo calculation.
                        </Typography>
                        {/* <GenericSelect<Location, LocationResponse>
                            endpoint='proxy/irrigation/api/v1/location/'
                            label='Locations'
                            transformResponse={response => response.locations}
                            selectedValue={selectedLocation}
                            setSelectedValue={setSelectedLocation}
                            getOptionLabel={item => `(${item.longitude}, ${item.latitude})`}
                            getOptionValue={item => item.id}>
                        </GenericSelect> */}
                        <DateRangeSelect
                            fromDate={fromDate}
                            setFromDate={setFromDate}
                            toDate={toDate}
                            setToDate={setToDate}>
                        </DateRangeSelect>
                        <Button
                            startIcon={<CalculateIcon />}
                            loading={loading}
                            loadingPosition="start"
                            onClick={handleSubmit}
                            // disabled={!selectedLocation || !fromDate || !toDate}
                            disabled={!fromDate || !toDate}
                            variant="contained">
                            Get calculations
                        </Button>
                        <Box>
                            {chartData && Array.isArray(chartData) &&
                                <LineChart
                                    xAxis={[
                                        {
                                            dataKey: 'x',
                                            scaleType: 'time',
                                            valueFormatter: (value) => value.toLocaleDateString(),
                                        }
                                    ]}
                                    series={[
                                        {
                                            dataKey: 'y',
                                            label: 'Value'
                                        },
                                    ]}
                                    dataset={chartData}
                                    height={280}
                                    hideLegend={true}
                                />}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default EToCalculatorPage;