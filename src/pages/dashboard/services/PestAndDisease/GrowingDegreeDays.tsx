import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import DateRangeSelect from "@components/shared/DateRangeSelect/DateRangeSelect";
import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import { GDDModel } from "@models/GDD";
import { PestModel, PestsResponseModel } from "@models/Pest";
import { Box, Button, Card, CardContent, Skeleton, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

interface FormattedGDDStage {
    start: string;
    end: string;
    descriptor: string;
    startDate: string;
    endDate: string;
}

interface ProcessedGDDModel {
    name: string;
    description: string;
    stages: FormattedGDDStage[];
}

const GrowingDegreeDaysPage = () => {

    const { session } = useSession()

    const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs().subtract(16, 'days'));
    const [toDate, setToDate] = useState<Dayjs | null>(dayjs().subtract(2, 'days'));
    const [selectedPest, setSelectedPest] = useState<string>('');

    const [loadingFormat, setLoadingFormat] = useState<boolean>(false);

    const [formattedData, setFormattedData] = useState<ProcessedGDDModel[] | null>(null);

    const { fetchData, response, error, loading } = useFetch<GDDModel>(
        `proxy/pdm/api/v1/model/${selectedPest}/gdd/?formatting=JSON&parcel_id=${session?.farm_parcel?.["@id"].split(":")[3]}&from_date=${fromDate?.format('YYYY-MM-DD')}&to_date=${toDate?.format('YYYY-MM-DD')}`,
        {
            method: 'GET',
        }
    );

    const handleDisplayGDD = () => {
        fetchData();
    };

    useEffect(() => {
        if (!response || !Array.isArray(response.models) || response.models.length === 0) {
            setFormattedData([]);
            return;
        }

        setLoadingFormat(true);

        const allProcessedModels = response.models.map(model => {
            const gddPoints = model.gdd_points;
            const gddValues = model.gdd_values;

            const processedStages = gddPoints.map(point => {

                const relevantValues = gddValues.filter(value =>
                    value.accumulated_gdd >= point.start && value.accumulated_gdd <= point.end
                );

                const startDate = relevantValues.length > 0 ? relevantValues[0].date : 'N/A';
                const endDate = relevantValues.length > 0 ? relevantValues[relevantValues.length - 1].date : 'N/A';

                return {
                    start: String(point.start),
                    end: String(point.end),
                    descriptor: point.descriptor,
                    startDate: startDate,
                    endDate: endDate,
                };
            });

            return {
                name: model.name,
                description: model.description,
                stages: processedStages,
            };
        });

        setFormattedData(allProcessedModels);
        setLoadingFormat(false);

    }, [response]);

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ContentGuard condition={session?.farm_parcel}>
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <GenericSelect<PestModel, PestsResponseModel>
                        endpoint='proxy/pdm/api/v1/disease/'
                        label='Pests'
                        transformResponse={response => response.diseases}
                        selectedValue={selectedPest}
                        setSelectedValue={setSelectedPest}
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
                        disabled={!session?.farm_parcel || !selectedPest || !fromDate || !toDate}
                    >
                        Display GDD
                    </Button></Box>
                    {(loading || loadingFormat) && <Skeleton variant="rectangular" height={48} />}
                    <Box display={'flex'} flexDirection={'column'} gap={2} >
                        {formattedData && !error && formattedData.map(model => {
                            return <Card key={`id-${model.name}-${model.description}`}>
                                <CardContent>
                                    <Typography variant="h4">{model.name}</Typography>
                                    <Typography gutterBottom variant="body1">{model.description}</Typography>
                                    <Box display={'flex'} flexDirection={'column'} gap={2} overflow={'auto'}>
                                        <Box display={'flex'} gap={2}>
                                            <Box display={'flex'} flex={1}>Threshold (hours)</Box>
                                            <Box display={'flex'} flex={1}>Dates</Box>
                                            <Box display={'flex'} flex={1}>Stage</Box>
                                        </Box>
                                        {model.stages.map(stage => {
                                            return <Box
                                                key={`id-stage-${model.name}-${model.description}-${stage.startDate}-${stage.endDate}-${stage.descriptor}`}
                                                display={'flex'}
                                                gap={2}
                                            >
                                                <Box display={'flex'} flex={1}>
                                                    <Typography fontWeight={'bold'}>{stage.start}-{stage.end}</Typography>
                                                </Box>
                                                <Box display={'flex'} flex={1}>
                                                    {stage.startDate} - {stage.endDate}
                                                </Box>
                                                <Box display={'flex'} flex={1}>
                                                    {stage.descriptor}
                                                </Box>
                                            </Box>
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>
                        })}
                    </Box>
                </Box>
            </ContentGuard>
        </>
    )
}

export default GrowingDegreeDaysPage;