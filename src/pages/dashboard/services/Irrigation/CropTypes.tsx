import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import GenericSortableTable from "@components/shared/GenericSortableTable/GenericSortableTable";
import { HeadCell } from "@components/shared/GenericSortableTable/GenericSortableTable.types";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AddCropType from "./AddCropType/AddCropType";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ServiceContextType } from "@layouts/services/IrrigationManagementLayout";
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import useDialog from "@hooks/useDialog";
import { CropTypeModel } from "@models/CropType";

interface CropRow {
    id: string;
    crop: string;
    kc_init: number;
    kc_mid: number;
    kc_end: number;
    actions: string;
}

const CropTypesPage = () => {
    const { actions } = useOutletContext<ServiceContextType>();
    const canAdd = actions.includes('add');
    const canEdit = actions.includes('edit');
    const canDelete = actions.includes('delete');

    const [rows, setRows] = useState<CropRow[]>([]);
    const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null);
    const [expanded, setExpanded] = useState<boolean>(false);

    const { fetchData, loading, response, error } = useFetch<CropTypeModel[]>(
        'proxy/irrigation/api/v1/eto/option-types/',
        { method: 'GET', noCache: true }
    );

    const { fetchData: deleteFetchData, response: deleteResponse, error: deleteError } = useFetch<any>(
        '',
        { method: 'DELETE' }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();
    const { dialogProps, showDialog } = useDialog();

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (error) showSnackbar('error', 'Error loading crop types');
    }, [error]);

    useEffect(() => {
        if (deleteError) showSnackbar('error', 'Error deleting crop type');
    }, [deleteError]);

    useEffect(() => {
        if (deleteResponse) {
            showSnackbar('success', 'Crop type deleted');
            fetchData();
        }
    }, [deleteResponse]);

    useEffect(() => {
        if (response) {
            setRows(response.map(c => ({
                id: c.id,
                crop: c.crop,
                kc_init: c.kc_init,
                kc_mid: c.kc_mid,
                kc_end: c.kc_end,
                actions: '',
            })));
        }
    }, [response]);

    const navigate = useNavigate();

    const headCells: readonly HeadCell<CropRow>[] = [
        { id: 'crop', numeric: false, label: 'Crop name' },
        { id: 'kc_init', numeric: true, label: 'Kc init' },
        { id: 'kc_mid', numeric: true, label: 'Kc mid' },
        { id: 'kc_end', numeric: true, label: 'Kc end' },
        { id: 'actions', numeric: false, label: 'Actions', disableSort: true, renderCell: (row) => (
            <Stack direction={'row'} spacing={1}>
                <IconButton
                    size="small"
                    disabled={!canEdit}
                    onClick={(e) => { e.stopPropagation(); navigate(`../crop-types/${row.id}`); }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                    size="small"
                    color="error"
                    disabled={!canDelete}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete({ id: row.id, label: row.crop });
                        showDialog({
                            title: `Delete crop type "${row.crop}"?`,
                            variant: 'yes-no',
                            children: <></>,
                        });
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Stack>
        ) },
    ];

    const handleDelete = async () => {
        if (!pendingDelete) return;
        await deleteFetchData({ url: `proxy/irrigation/api/v1/eto/crop-types/${pendingDelete.id}/` });
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
                    <Typography component="span">Add new crop type</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <AddCropType onAction={onAddNew} existingNames={rows.map(r => r.crop)} />
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

export default CropTypesPage;
