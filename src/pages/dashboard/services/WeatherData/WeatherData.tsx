import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { Skeleton } from "@mui/material";
import { useEffect } from "react";

const WeatherDataPage = () => {
    const { session } = useSession();

    const { fetchData, loading, response, error } = useFetch<any>(
        `proxy/weather_data/api/data/weather/?lat=${session?.farm_parcel?.location.lat}&lon=${session?.farm_parcel?.location.long}`,
        {
            method: 'GET',
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        fetchData();
    }, [session?.farm_parcel])

    useEffect(() => {
        if (response) {
            console.log(response);
        }
    }, [response])

    useEffect(() => {
        if (error) {
            showSnackbar('error', 'Error loading weather');
        }
    }, [error])

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {!loading && <div>weather data works</div>}
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default WeatherDataPage;