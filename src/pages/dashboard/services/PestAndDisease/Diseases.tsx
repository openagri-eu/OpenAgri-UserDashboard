import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
// import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import { GDDModel } from "@models/GDD.jsonld";
import { Box } from "@mui/material";
import { useEffect } from "react";

const DiseasesPage = () => {

    // const { session } = useSession()

    const { fetchData, /*response, error, loading*/ } = useFetch<GDDModel>(
        `proxy/pdm/api/v1/disease/`,
        {
            method: 'GET',
        }
    );

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <Box display={'flex'} flexDirection={'column'} gap={2}>
                <div>diseases works</div>
            </Box>
        </>
    )
}

export default DiseasesPage;