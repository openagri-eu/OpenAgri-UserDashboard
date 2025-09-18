import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import DiseaseDetails from "@components/services/DiseaseDetails/DiseaseDetails";
import useDialog from "@hooks/useDialog";
import useFetch from "@hooks/useFetch";
import { DiseaseModel, DiseasesResponseModel } from "@models/Disease";
import { Box, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";

const DiseasesPage = () => {
    const [diseases, setDiseases] = useState<DiseaseRow[]>([]);
    const [selectedDisease, setSelectedDisease] = useState<DiseaseModel | undefined>(undefined);

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
        setSelectedDisease({
            id: disease.id,
            name: disease.name,
            base_gdd: disease.baseGDD,
            eppo_code: disease.eppoCode,
            description: disease.description,
            gdd_points: disease.gddPoints
        });
        showDialog({
            title: `Details for ${disease.name}`,
            variant: 'empty',
            children: <></>
        });
    };

    const handleCloseDialog = () => {
        dialogProps.onClose();
        setSelectedDisease(undefined);
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
                <DiseaseDetails disease={selectedDisease}></DiseaseDetails>
            </GenericDialog>
        </>
    )
}

export default DiseasesPage;