import ContentGuard from "@components/shared/ContentGuard/ContentGuard";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { useSession } from "@contexts/SessionContext";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { UAVFlightForecastModel } from "@models/UAVFlightForecast";
import { Skeleton } from "@mui/material";
import { useEffect, useState } from "react";

const UAVFlightsForecast = () => {
    const { session } = useSession();

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();
    const [loadingFormat, setLoadingFormat] = useState<boolean>(false);

    const [agriMachines, setAgriMachines] = useState<string[]>([]);


    const { fetchData: uavFetchData, loading: uavLoading, response: uavResponse, error: uavError } = useFetch<UAVFlightForecastModel[]>(
        `proxy/weather_data/api/data/flight-forecast5/?lat=${session?.farm_parcel?.location.lat}&lon=${session?.farm_parcel?.location.long}`
        + `${agriMachines.map((am) => { return '&uavmodels=' + am })}`,
        {
            method: 'GET',
        }
    );

    const { fetchData: agriMachineFetchData, loading: agriMachinesLoading, response: agriMachinesResponse, error: agriMachinesError } = useFetch<any[]>(
        `proxy/farmcalendar/api/v1/AgriculturalMachines/?format=json`,
        {
            method: 'GET',
        }
    );

    useEffect(() => {
        if (session?.farm_parcel) {
            agriMachineFetchData();
        }
    }, [session?.farm_parcel])

    useEffect(() => {
        setLoadingFormat(true);
        console.log(uavResponse);
        setLoadingFormat(false);
    }, [uavResponse])

    useEffect(() => {
        if (agriMachinesResponse) {
            const agriMachinesArray = agriMachinesResponse.flatMap((am) => {
                return am.model
            })
            setAgriMachines(agriMachinesArray)
        }

    }, [agriMachinesResponse])

    useEffect(() => {
        if (agriMachines.length) {
            console.log(agriMachines);
            uavFetchData();
        }

    }, [agriMachines])

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
                {(uavLoading || agriMachinesLoading || loadingFormat) && <Skeleton variant="rectangular" height={48} />}
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

export default UAVFlightsForecast;
