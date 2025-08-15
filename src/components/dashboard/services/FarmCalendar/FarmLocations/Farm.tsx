import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmModel } from "@models/Farm";
import { Box, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Farm = () => {

    const [farm, setFarm] = useState<FarmModel>();

    const { id } = useParams();
    const { fetchData, loading, response, error } = useFetch<FarmModel>(
        `proxy/farmcalendar/api/v1/Farm/${id}/?format=json`,
        {
            method: 'GET',
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        if (error) {
            showSnackbar('error', 'Error loading farm');
        }
    }, [error])

    useEffect(() => {
        if (response) {
            setFarm(response);
        }
    }, [response])

    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !loading && !error &&
                <Box>
                    <Typography variant={'h4'}>{farm?.name}</Typography>
                </Box>
            }
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default Farm;