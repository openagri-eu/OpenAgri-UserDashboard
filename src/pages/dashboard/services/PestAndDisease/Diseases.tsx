import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import useFetch from "@hooks/useFetch";
import { DiseasesResponseModel } from "@models/Disease";
import { Box, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";

const DiseasesPage = () => {
    const [diseases, setDiseases] = useState<DiseaseRow[]>([]);

    const { fetchData, response, error, loading } = useFetch<DiseasesResponseModel>(
        `proxy/pdm/api/v1/disease/`,
        {
            method: 'GET',
        }
    );

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (response) {
            const formattedDiseases = response.diseases.map((d) => {
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
    }, [response])

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
        { id: 'description', numeric: false, label: 'Description' },
        { id: 'eppoCode', numeric: false, label: 'EPPO code' },
        { id: 'baseGDD', numeric: false, label: 'Base GDD' },
    ];

    const handleRowClick = (disease: DiseaseRow) => {
        console.log(disease);
    };

    return (
        <>
            <Box display={'flex'} flexDirection={'column'} gap={2}>
                {loading && <Skeleton variant="rectangular" height={48} />}
                {
                    !loading && !error &&
                    <GenericSortableTable data={diseases} headCells={diseasesHeadCells} onRowClick={handleRowClick}></GenericSortableTable>
                }
            </Box>
        </>
    )
}

export default DiseasesPage;