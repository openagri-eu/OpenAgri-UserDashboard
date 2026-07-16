import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ServiceContextType } from "@layouts/services/FarmCalendarLayout";
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import useDialog from "@hooks/useDialog";
import { FarmAnimalModel } from "@models/FarmAnimalModel";
import AddFarmAnimal from "./AddFarmAnimal/AddFarmAnimal";

interface AnimalRow {
    id: string;
    name: string;
    nationalID: string;
    species: string;
    breed: string;
    actions: string;
}

const FarmAnimalsPage = () => {
    const { actions } = useOutletContext<ServiceContextType>();
    const canAdd = actions.includes('add');
    const canEdit = actions.includes('edit');
    const canDelete = actions.includes('delete');

    const [rows, setRows] = useState<AnimalRow[]>([]);
    const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null);
    const [expanded, setExpanded] = useState<boolean>(false);

    const { fetchData, loading, response, error } = useFetch<FarmAnimalModel[]>(
        'proxy/farmcalendar/api/v1/FarmAnimals/?format=json',
        { method: 'GET' }
    );

    const { fetchData: deleteFetchData, response: deleteResponse, error: deleteError } = useFetch<any>(
        '',
        { method: 'DELETE' }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();
    const { dialogProps, showDialog } = useDialog();

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (error) showSnackbar('error', 'Error loading animals');
    }, [error]);

    useEffect(() => {
        if (deleteError) showSnackbar('error', 'Error deleting animal');
    }, [deleteError]);

    useEffect(() => {
        if (deleteResponse) {
            showSnackbar('success', 'Animal deleted');
            fetchData();
        }
    }, [deleteResponse]);

    useEffect(() => {
        if (Array.isArray(response)) {
            setRows(response.map(a => ({
                id: a["@id"].split(':').pop() ?? '',
                name: a.name,
                nationalID: a.nationalID,
                species: a.species,
                breed: a.breed,
                actions: '',
            })));
        }
    }, [response]);

    const navigate = useNavigate();

    const headCells: readonly HeadCell<AnimalRow>[] = [
        { id: 'name', numeric: false, label: 'Name' },
        { id: 'nationalID', numeric: false, label: 'National ID' },
        { id: 'species', numeric: false, label: 'Species' },
        { id: 'breed', numeric: false, label: 'Breed' },
        {
            id: 'actions', numeric: false, label: 'Actions', disableSort: true, renderCell: (row) => (
                <Stack direction={'row'} spacing={1}>
                    <IconButton
                        size="small"
                        disabled={!canEdit}
                        onClick={(e) => { e.stopPropagation(); navigate(`../farm-animals/${row.id}`); }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        disabled={!canDelete}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPendingDelete({ id: row.id, label: row.name || row.nationalID || row.species });
                            showDialog({
                                title: `Delete animal "${row.name || row.nationalID || row.species}"?`,
                                variant: 'yes-no',
                                children: <></>,
                            });
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            )
        },
    ];

    const handleDelete = async () => {
        if (!pendingDelete) return;
        await deleteFetchData({ url: `proxy/farmcalendar/api/v1/FarmAnimals/${pendingDelete.id}/` });
        setPendingDelete(null);
    };

    const onAddNew = () => {
        fetchData();
        setExpanded(false);
    };

    return (
        <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Accordion disabled={!canAdd} expanded={expanded} onChange={() => setExpanded(v => !v)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography component="span">Add new animal</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <AddFarmAnimal onAction={onAddNew} />
                </AccordionDetails>
            </Accordion>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {!(loading) && !error && (
                <GenericSortableTable data={rows} headCells={headCells} />
            )}
            <GenericDialog {...dialogProps} onYes={handleDelete} />
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </Box>
    );
};

export default FarmAnimalsPage;
