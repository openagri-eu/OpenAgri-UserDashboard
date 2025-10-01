import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { useEffect } from "react";

const SprayForecast = () => {
    const { session } = useSession();

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    const { fetchData: sprayFetchData, response: sprayResponse, error: sprayError } = useFetch<any[]>(
        `proxy/weather_data/api/data/spray-forecast/?lat=${session?.farm_parcel?.location.lat}&lon=${session?.farm_parcel?.location.long}`,
        {
            method: 'GET',
        }
    );

    useEffect(() => {
        if (session?.farm_parcel) {
            sprayFetchData();
        }
    }, [session?.farm_parcel])

    useEffect(() => {
        if (sprayError) {
            showSnackbar('error', 'Error loading spray forecast');
        }
    }, [sprayError])

    useEffect(() => {
        if (sprayResponse) {
            console.log(sprayResponse);
        }
    }, [sprayResponse])


    return (
        <>
            <ContentGuard condition={session?.farm_parcel}>
                spray forecast works
            </ContentGuard>
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default SprayForecast;
