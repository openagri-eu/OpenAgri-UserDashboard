import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmParcel } from "@models/FarmParcel";
import { Skeleton } from "@mui/material";
import { useEffect, useState } from "react";

const FarmCalendar = () => {

    const [parcels, setParcels] = useState<FarmParcel[]>([]);
    const [parcelData, setParcelData] = useState<ParcelRow[]>([]);

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
            setParcels(response);
            const formattedParcels = parcels.map((p) => {
                return {
                    id: p["@id"],
                    farm: p.farm["@type"],
                    identifier: p.identifier,
                    parcelType: p["@type"],
                    validFromTo: `From: ${p.validFrom}\nUntil: ${p.validTo}`,
                    coordinates: `${p.location.lat}\n${p.location.long}`,
                    timestamps: `Created: ${p.created_at}\nUpdated: ${p.updated_at}`,
                }
            })
            setParcelData(formattedParcels);
        }
    }, [response])

    interface ParcelRow {
        id: string;
        farm: string;
        identifier: string;
        parcelType: string;
        validFromTo: string;
        coordinates: string;
        timestamps: string;
    }

    const parcelHeadCells: readonly HeadCell<ParcelRow>[] = [
        { id: 'farm', numeric: false, label: 'Farm' },
        { id: 'identifier', numeric: false, label: 'Identifier' },
        { id: 'parcelType', numeric: false, label: 'Parcel Type' },
        { id: 'validFromTo', numeric: false, label: 'Valid from - Valid until' },
        { id: 'coordinates', numeric: false, label: 'Coordinates' },
        { id: 'timestamps', numeric: false, label: 'Timestamps' },
    ];

    const handleRowClick = (parcel: ParcelRow) => {
        console.log("Clicked on parcel:", parcel.identifier);
    };

    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !loading && !error &&
                <GenericSortableTable data={parcelData} headCells={parcelHeadCells} onRowClick={handleRowClick}></GenericSortableTable>
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