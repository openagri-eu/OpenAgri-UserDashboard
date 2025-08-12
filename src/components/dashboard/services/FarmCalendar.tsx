import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmParcel } from "@models/FarmParcel";
import { Skeleton } from "@mui/material";
import { useEffect, useState } from "react";

const FarmCalendar = () => {

    const [parcels, setParcels] = useState<FarmParcel[]>([]);

    const { fetchData, loading, response, error } = useFetch<FarmParcel[]>(
        "proxy/farmcalendar/api/v1/FarmParcels/?format=json",
        {
            method: 'GET',
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (error) {
            showSnackbar('error', 'Error loading parcel list');
        }
    }, [error])

    useEffect(() => {
        if (response) {
            setParcels(response)
        }
    }, [response])

    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !loading && !error &&
                parcels.map((p) => {
                    return <div>{p.identifier}</div>
                })
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

export default FarmCalendar;