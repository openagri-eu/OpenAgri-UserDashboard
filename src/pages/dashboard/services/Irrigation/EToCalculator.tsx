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
import GenericSelect from "@components/shared/GenericSelect/GenericSelect";


const EToCalculatorPage = () => {

    const { session } = useSession();

    // const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs().subtract(14, 'days'));
    const [toDate, setToDate] = useState<Dayjs | null>(dayjs());
    const [calculations, setSetCalculations] = useState<EToCalculation | undefined>(undefined);
    const [selectedCropType, setSelectedCropType] = useState<string>('');
    const [selectedCropStage, setSelectedCropStage] = useState<string>('');


    const [chartData, setChartData] = useState<
        { x: Date; y: number; }[] | undefined>(undefined);


    const { fetchData, response, error, loading } = useFetch<EToCalculation>(
        `proxy/irrigation/api/v1/eto/calculate-gk/?parcel_id=${session?.farm_parcel?.["@id"].split(":")[3]}&from_date=${fromDate?.format('YYYY-MM-DD')}&to_date=${toDate?.format('YYYY-MM-DD')}&formatting=JSON${selectedCropType && '&crop=' + selectedCropType}${selectedCropStage && '&stage=' + selectedCropStage}`,
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
                            Select a location and a time frame to view its ETo calculation. Additionally select the crop type and growth stage for finer tuning.
                        </Typography>
                        <GenericSelect<string, { crops: string[], stages: string[] }>
                            endpoint='proxy/irrigation/api/v1/eto/option-types/'
                            method="GET"
                            label='Crop type'
                            selectedValue={selectedCropType}
                            transformResponse={response => response.crops}
                            setSelectedValue={setSelectedCropType}
                            getOptionLabel={item => item}
                            getOptionValue={item => item}
                        />
                        <GenericSelect<string, { crops: string[], stages: string[] }>
                            endpoint='proxy/irrigation/api/v1/eto/option-types/'
                            method="GET"
                            label='Stages'
                            selectedValue={selectedCropStage}
                            transformResponse={response => response.stages}
                            setSelectedValue={setSelectedCropStage}
                            getOptionLabel={item => item}
                            getOptionValue={item => item}
                        />
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
                            disabled={!fromDate || !toDate || Boolean(selectedCropType && !selectedCropStage) || Boolean(selectedCropStage && !selectedCropType)}
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