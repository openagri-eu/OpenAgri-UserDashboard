import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import useDialog from "@hooks/useDialog";
import useFetch from "@hooks/useFetch";
import { DiseasesResponseModel } from "@models/Disease";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const DiseasesPage = () => {
    const [diseases, setDiseases] = useState<DiseaseRow[]>([]);
    const [selectedDisease, setSelectedDisease] = useState<DiseaseRow | null>(null);

    const { fetchData: getFetchData, response: getResponse, error: getError, loading: getLoading } = useFetch<DiseasesResponseModel>(
        `proxy/pdm/api/v1/disease/`,
        {
            method: 'GET',
        }
    );

    const { dialogProps, showDialog } = useDialog();

    useEffect(() => {
        getFetchData();
    }, []);

    useEffect(() => {
        if (getResponse) {
            const formattedDiseases = getResponse.diseases.map((d) => {
                return {
                    id: d.id,
                    name: d.name,
                    description: d.description,
                    eppoCode: d.eppo_code,
                    baseGDD: d.base_gdd,
                    gddPoints: d.gdd_points
                }
            })
            setDiseases(formattedDiseases);
        }
    }, [getResponse])

    interface DiseaseRow {
        id: string;
        name: string;
        description: string;
        eppoCode: string;
        baseGDD: number;
        gddPoints: {
            id: number;
            start: number
            end: number
            descriptor: string;
        }[]
    }

    const diseasesHeadCells: readonly HeadCell<DiseaseRow>[] = [
        { id: 'name', numeric: false, label: 'Name' },
        { id: 'eppoCode', numeric: false, label: 'EPPO code' },
        { id: 'baseGDD', numeric: false, label: 'Base GDD' },
    ];

    const handleRowClick = (disease: DiseaseRow) => {
        setSelectedDisease(disease);
        showDialog({
            title: `Details for ${disease.name}`,
            variant: 'empty',
            children: <></>
        });
    };

    const handleCloseDialog = () => {
        dialogProps.onClose();
        setSelectedDisease(null);
    };

    return (
        <>
            <Box display={'flex'} flexDirection={'column'} gap={2}>
                {getLoading && <Skeleton variant="rectangular" height={48} />}
                {
                    !getLoading && !getError &&
                    <GenericSortableTable data={diseases} headCells={diseasesHeadCells} onRowClick={handleRowClick}></GenericSortableTable>
                }
            </Box>
            <GenericDialog {...dialogProps} onClose={handleCloseDialog}>
                <>
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        <Typography variant="body1">
                            Disease description: {selectedDisease?.description}
                        </Typography>
                        <Typography variant="body1">
                            EPPO code: {selectedDisease?.eppoCode}
                        </Typography>
                        <Typography variant="body1">
                            Base GDD: {selectedDisease?.baseGDD}
                        </Typography>
                        <Typography variant="h6">GDD points</Typography>
                        {selectedDisease?.gddPoints.map(gddp => {
                            return <Card key={"GDDP-ID-" + gddp.id}>
                                <CardContent>
                                    <div>From: {gddp.start}</div>
                                    <div>To: {gddp.end}</div>
                                    <div>Descriptor: {gddp.descriptor}</div>
                                </CardContent>
                            </Card>
                        })}
                    </Box>
                </>
            </GenericDialog>
        </>
    )
}

export default DiseasesPage;