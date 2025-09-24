import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmParcelModel } from "@models/FarmParcel";
import { Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FarmParcelsPage = () => {
    const [parcels, setParcels] = useState<ParcelRow[]>([]);

    const { fetchData, loading, response, error } = useFetch<FarmParcelModel[]>(
        "proxy/farmcalendar/api/v1/FarmParcels/?format=json",
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
            showSnackbar('error', 'Error loading parcel list');
        }
    }, [error])

    useEffect(() => {
        if (response) {
            const formattedParcels = response.map((p) => {
                return {
                    id: p["@id"],
                    farm: p.farm["@type"],
                    identifier: p.identifier,
                    parcelType: p["@type"],
                    timestamps: `Created: ${p.created_at}\nUpdated: ${p.updated_at}`,
                }
            })
            setParcels(formattedParcels);
        }
    }, [response])

    interface ParcelRow {
        id: string;
        farm: string;
        identifier: string;
        parcelType: string;
        timestamps: string;
    }

    const parcelHeadCells: readonly HeadCell<ParcelRow>[] = [
        { id: 'farm', numeric: false, label: 'Farm' },
        { id: 'identifier', numeric: false, label: 'Identifier' },
        { id: 'parcelType', numeric: false, label: 'Parcel type' },
        { id: 'timestamps', numeric: false, label: 'Timestamps' },
    ];

    const navigate = useNavigate();

    const handleRowClick = (parcel: ParcelRow) => {
        navigate(`../farm-parcel/${parcel.id.split(":")[3]}`);
    };
    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !loading && !error &&
                <GenericSortableTable data={parcels} headCells={parcelHeadCells} onRowClick={handleRowClick}></GenericSortableTable>
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

export default FarmParcelsPage;