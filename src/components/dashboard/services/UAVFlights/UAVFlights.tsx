import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { useEffect } from "react";

const UAVFlights = () => {
    const { session } = useSession();

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    const { fetchData: uavFetchData, response: uavResponse, error: uavError } = useFetch<any[]>(
        `proxy/weather_data/api/data/flight-forecast5/?lat=${session?.farm_parcel?.location.lat}&lon=${session?.farm_parcel?.location.long}`,
        {
            method: 'GET',
        }
    );

    const { fetchData: agriMachinceFetchData, response: agriMachinesResponse, error: agriMachinesError } = useFetch<any[]>(
        `proxy/farmcalendar/api/v1/AgriculturalMachines/?format=json`,
        {
            method: 'GET',
        }
    );

    useEffect(() => {
        if (session?.farm_parcel) {
            uavFetchData();
            agriMachinceFetchData();
        }
    }, [session?.farm_parcel])

    useEffect(() => {
        console.log(uavResponse);

    }, [uavResponse])

    useEffect(() => {
        console.log(agriMachinesResponse);

    }, [agriMachinesResponse])

    useEffect(() => {
        if (agriMachinesError) {
            showSnackbar('error', 'Error loading agri machines');
        }
    }, [agriMachinesError])

    useEffect(() => {
        if (uavError) {
            showSnackbar('error', 'Error loading UAV flights');
        }
    }, [uavError])


    return (
        <>
            <ContentGuard condition={session?.farm_parcel}>
                UAV flights works
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

export default UAVFlights;
