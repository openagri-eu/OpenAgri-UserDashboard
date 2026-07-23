import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmModel } from "@models/Farm";
import { FarmParcelModel } from "@models/FarmParcel";
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AddWinery from "./AddWinery/AddWinery";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ServiceContextType } from "@layouts/services/FarmCalendarLayout";


const WineriesPage = () => {
    const { actions } = useOutletContext<ServiceContextType>();
    const canAdd = actions.includes('add');

    const [wineries, setWineries] = useState<WineryRow[]>([]);

    const [expanded, setExpanded] = useState<boolean>(false);

    const handleAccordionChange = () => {
        setExpanded(!expanded);
    };

    const { fetchData, loading, response, error } = useFetch<FarmParcelModel[]>(
        "proxy/farmcalendar/api/v1/FarmParcels/?parcel_type=Winery&format=json",
        {
            method: 'GET',
        }
    );

    const { fetchData: farmsFetchData, loading: farmsLoading, response: farmsResponse, error: farmsError } = useFetch<FarmModel[]>(
        "proxy/farmcalendar/api/v1/Farm/?format=json",
        {
            method: 'GET',
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        fetchData();
        farmsFetchData();
    }, [])

    useEffect(() => {
        if (error || farmsError) {
            showSnackbar('error', 'Error loading winery list');
        }
    }, [error, farmsError])

    useEffect(() => {
        if (response && farmsResponse) {
            const formattedWineries = response.map((w) => {
                return {
                    id: w["@id"],
                    farm: farmsResponse.find((f: FarmModel) => { return f["@id"] === w.farm["@id"] })?.name ?? 'N/A',
                    toponym: w.hasToponym,
                    identifier: w.identifier,
                    timestamps: `Created: ${dayjs(w.created_at)}\nUpdated: ${dayjs(w.updated_at)}`,
                }
            })
            setWineries(formattedWineries);
        }
    }, [response, farmsResponse])

    interface WineryRow {
        id: string;
        farm: string;
        toponym: string;
        identifier: string;
        timestamps: string;
    }

    const wineryHeadCells: readonly HeadCell<WineryRow>[] = [
        { id: 'farm', numeric: false, label: 'Farm' },
        { id: 'toponym', numeric: false, label: 'Toponym' },
        { id: 'identifier', numeric: false, label: 'Identifier' },
        { id: 'timestamps', numeric: false, label: 'Timestamps' },
    ];

    const navigate = useNavigate();

    const handleRowClick = (winery: WineryRow) => {
        navigate(`../wineries/${winery.id.split(":")[3]}`);
    };

    const onAddNewWinery = () => {
        fetchData();
        setExpanded(false);
    };

    return (
        <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Accordion disabled={!canAdd} expanded={expanded} onChange={handleAccordionChange}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">Add new winery</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ maxHeight: 480, overflowY: 'scroll' }}>
                    <AddWinery onAction={onAddNewWinery}></AddWinery>
                </AccordionDetails>
            </Accordion>
            {loading || farmsLoading && <Skeleton variant="rectangular" height={48} />}
            {
                !(loading || farmsLoading) && !error &&
                <GenericSortableTable data={wineries} headCells={wineryHeadCells} onRowClick={handleRowClick}></GenericSortableTable>
            }
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </Box>
    )
}

export default WineriesPage;
