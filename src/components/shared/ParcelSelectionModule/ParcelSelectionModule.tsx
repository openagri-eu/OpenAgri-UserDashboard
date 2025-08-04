import useFetch from "@hooks/useFetch";
import { useEffect, useState } from "react";
import GenericSnackbar from "../GenericSnackbar/GenericSnackbar";
import useSnackbar from "@hooks/useSnackbar";
import { FarmParcel } from "@models/FarmParcel";
import { useSession } from "@contexts/SessionContext";

const ParcelSelectionModule = () => {

    const [parcels, setParcels] = useState<FarmParcel[]>([]);
    const { session, setSession } = useSession();

    const { fetchData, loading, response, error } = useFetch<FarmParcel[]>(
        "FarmParcels/?format=json",
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

    const selectFarmParcel = (parcel?: FarmParcel) => {
        setSession(prevSession => {
            if (prevSession) {
                return {
                    ...prevSession,
                    farm_parcel: parcel,
                };
            }
            return null;
        });
    };

    return (
        <>
            {loading && <div>loading</div>}
            {!session?.farm_parcel && <div>No parcel selected</div>}
            {session?.farm_parcel && <div>Selected parcel: {session.farm_parcel.identifier}</div>}
            <div>
                <div>Parcels:</div>
                {
                    parcels.map((p) => {
                        return <div onClick={() => selectFarmParcel(p)}>{p.identifier}</div>
                    })
                }
                <div onClick={() => selectFarmParcel(undefined)}>Remove selected parcel</div>
            </div>
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
};

export default ParcelSelectionModule;