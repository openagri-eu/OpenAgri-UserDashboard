import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmParcelModel } from "@models/FarmParcel";
import { Box, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const FarmParcel = () => {

    const [parcel, setParcel] = useState<FarmParcelModel>();

    const { id } = useParams();
    const { fetchData, loading, response, error } = useFetch<FarmParcelModel>(
        `proxy/farmcalendar/api/v1/FarmParcels/${id}/?format=json`,
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
            showSnackbar('error', 'Error loading parcel');
        }
    }, [error])

    useEffect(() => {
        if (response) {
            setParcel(response);
        }
    }, [response])

    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !loading && !error &&
                <Box>
                    <Typography variant={'h4'}>{parcel?.identifier}</Typography>
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

export default FarmParcel;