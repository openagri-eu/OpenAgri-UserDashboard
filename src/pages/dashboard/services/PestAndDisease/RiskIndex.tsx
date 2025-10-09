import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import DateRangeSelect from "@components/shared/DateRangeSelect/DateRangeSelect";
import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import { Box, Button, Card, CardContent, Skeleton, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { DiseaseModel, DiseasesResponseModel } from "@models/Disease";
import { RiskIndexModel, RiskIndexStatus } from "@models/RiskIndex.jsonld";
import { LineChart } from "@mui/x-charts";
import { colors } from "@theme/colors";

interface DailyData {
    time?: string[];
    riskIndex?: RiskIndexStatus[]
}

interface FormattedRiskIndexData {
    [day: string]: DailyData
}

const riskLevelMapping = (label: string): number => {
    switch (label) {
        case 'low':
            return 0;
        case 'moderate':
            return 1;
        case 'high':
            return 2;
        default:
            return 0;
    }
};

const riskLevelLabels = ['low', 'medium', 'high'];

const RiskIndexPage = () => {

    const { session } = useSession()

    const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs().subtract(9, 'days'));
    const [toDate, setToDate] = useState<Dayjs | null>(dayjs().subtract(2, 'days'));
    const [selectedDisease, setSelectedDisease] = useState<string>('');

    const [loadingFormat, setLoadingFormat] = useState<boolean>(false);

    const [formattedData, setFormattedData] = useState<FormattedRiskIndexData | null>(null);



    const { fetchData, response, error, loading } = useFetch<RiskIndexModel>(
        `proxy/pdm/api/v1/model/${selectedDisease}/risk-index/?parcel_id=${session?.farm_parcel?.["@id"].split(":")[3]}&from_date=${fromDate?.format('YYYY-MM-DD')}&to_date=${toDate?.format('YYYY-MM-DD')}`,
        {
            method: 'GET',
        }
    );

    const handleDisplayGDD = () => {
        fetchData();
    };

    useEffect(() => {
        if (response && Array.isArray(response["@graph"]?.[0]?.hasMember)) {
            setLoadingFormat(true);

            const processedData = response["@graph"][0].hasMember.reduce<FormattedRiskIndexData>((accumulator, currentItem) => {
                const { phenomenonTime, hasSimpleResult } = currentItem;
                const [date, timeString] = phenomenonTime.split('T');
                const time = timeString.replace('Z', '');

                if (!accumulator[date]) {
                    accumulator[date] = { time: [], riskIndex: [] };
                }

                accumulator[date]?.time?.push(time);
                accumulator[date]?.riskIndex?.push(hasSimpleResult);

                return accumulator;
            }, {});

            setFormattedData(processedData);
            setLoadingFormat(false);
        }
    }, [response]);

    useEffect(() => {
        if (formattedData) {
            console.log(formattedData);
        }
    }, [formattedData])

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ContentGuard condition={session?.farm_parcel}>
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <GenericSelect<DiseaseModel, DiseasesResponseModel>
                        endpoint='proxy/pdm/api/v1/pest-model/'
                        label='Diseases'
                        transformResponse={response => response.pests}
                        selectedValue={selectedDisease}
                        setSelectedValue={setSelectedDisease}
                        getOptionLabel={item => item.name}
                        getOptionValue={item => item.id}>
                    </GenericSelect>
                    <DateRangeSelect
                        fromDate={fromDate}
                        setFromDate={setFromDate}
                        toDate={toDate}
                        setToDate={setToDate}
                        maxDate={dayjs().subtract(2, 'days')}>
                    </DateRangeSelect>
                    <Box><Button
                        onClick={() => handleDisplayGDD()}
                        variant="contained"
                        disabled={!session?.farm_parcel || !selectedDisease || !fromDate || !toDate}
                    >
                        Display risk index
                    </Button></Box>
                    {(loading || loadingFormat) && <Skeleton variant="rectangular" height={48} />}
                    {!(loading || loadingFormat) && !error && formattedData &&
                        <Box display={'flex'} flexDirection={'column'} gap={2}>
                            {Object.entries(formattedData).map(([date, dailyData]: [string, DailyData]) => {
                                const numericalRiskData = dailyData.riskIndex?.map(
                                    (status) => riskLevelMapping(status)
                                ).filter(value => value !== undefined) as number[] || [];
                                return <Card key={`id-date-${date}`}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h4">{dayjs(date).format('dddd, D/MMM/YYYY')}</Typography>
                                        <Box display={'flex'} flexDirection={'column'} gap={2} overflow={'auto'}>
                                            <LineChart
                                                series={[
                                                    {
                                                        data: numericalRiskData,
                                                        label: 'Risk Level',
                                                        valueFormatter: (value) =>
                                                            value !== null ? riskLevelLabels[value] : 'N/A',
                                                    },
                                                ]}
                                                xAxis={[{
                                                    scaleType: 'point',
                                                    label: 'Time',
                                                    data: dailyData.time?.map(t => {
                                                        return dayjs(date + t).format('H')
                                                    }),
                                                }]}
                                                yAxis={[{
                                                    min: 0,
                                                    max: riskLevelLabels.length - 1,
                                                    tickInterval: riskLevelLabels.map((_, index) => index),
                                                    valueFormatter: (value: number) => riskLevelLabels[value],
                                                }]}
                                                height={200}
                                                colors={[colors.primary.main]}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            })}
                        </Box>
                    }
                </Box>
            </ContentGuard>
        </>
    )
}

export default RiskIndexPage;