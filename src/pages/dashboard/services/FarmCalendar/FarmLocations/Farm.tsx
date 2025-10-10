import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmModel } from "@models/Farm";
import { Box, Button, Card, CardContent, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import useDialog from "@hooks/useDialog";
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";

const FarmPage = () => {
    const [farm, setFarm] = useState<FarmModel>();
    const [title, setTitle] = useState<string>('');

    const { id } = useParams();
    const { fetchData, loading, response, error } = useFetch<FarmModel>(
        `proxy/farmcalendar/api/v1/Farm/${id}/?format=json`,
        {
            method: 'GET',
        }
    );

    const { fetchData: editFetchData, response: editResponse, error: editError } = useFetch<any>(
        `proxy/farmcalendar/api/v1/Farm/${id}/?format=json`,
        {
            method: 'PATCH',
        }
    );

    const { fetchData: deleteFetchData, error: deleteError } = useFetch<any>(
        `proxy/farmcalendar/api/v1/Farm/${id}/?format=json`,
        {
            method: 'DELETE',
        }
    );

    const { dialogProps, showDialog } = useDialog();

    const handleCloseDialog = () => {
        dialogProps.onClose();
    };

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        fetchData();
    }, [])

    useEffect(() => {
        if (error) {
            showSnackbar('error', 'Error loading farm');
        }
    }, [error])

    useEffect(() => {
        if (editError) {
            showSnackbar('error', 'Error editing farm');
        }
    }, [editError])

    useEffect(() => {
        if (deleteError) {
            showSnackbar('error', 'Error deleting farm');
        }
    }, [deleteError])

    useEffect(() => {
        if (response) {
            setFarm(response);
            setTitle(response.name);
        }
    }, [response])

    const navigate = useNavigate();
    useEffect(() => {
        if (editResponse) {
            navigate("/farm-locations/farms");
        }
    }, [editResponse])

    const handleDelete = async () => {
        await deleteFetchData();
        navigate("/farm-locations/farms");
    };

    const handleEdit = () => {
        editFetchData({
            body: farm
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');

        setFarm(prev => {
            if (!prev) return undefined;

            const newState = JSON.parse(JSON.stringify(prev)) as FarmModel;
            let currentLevel: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel = currentLevel[keys[i]];
            }
            currentLevel[keys[keys.length - 1]] = value;

            return newState;
        });
    };


    const isFormInvalid =
        !farm?.name.trim() ||
        !farm.administrator ||
        !farm.description ||
        !farm.contactPerson.firstname ||
        !farm.contactPerson.lastname ||
        !farm.telephone ||
        !farm.vatID ||
        !farm.address.adminUnitL1 ||
        !farm.address.adminUnitL2 ||
        !farm.address.addressArea ||
        !farm.address.municipality ||
        !farm.address.community ||
        !farm.address.locatorName;

    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !loading && !error &&
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <Typography variant={'h4'}>Edit {title}</Typography>
                    <Card>
                        <CardContent>
                            <Stack direction={'column'} spacing={2} >
                                <TextField fullWidth margin="normal" label="Farm name" name="name" value={farm?.name ?? ''} onChange={handleChange} error={!farm?.name.trim()} />
                                <TextField fullWidth margin="normal" label="administrator" name="administrator" value={farm?.administrator ?? ''} onChange={handleChange} error={!farm?.administrator.trim()} />
                                <TextField fullWidth margin="normal" multiline rows={3} label="Farm description" name="description" value={farm?.description ?? ''} onChange={handleChange} error={!farm?.description?.trim()} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Contact person first name" name="contactPerson.firstname" value={farm?.contactPerson.firstname ?? ''} onChange={handleChange} error={!farm?.contactPerson.firstname?.trim()} />
                                    <TextField fullWidth margin="normal" label="Contact person last name" name="contactPerson.lastname" value={farm?.contactPerson.lastname ?? ''} onChange={handleChange} error={!farm?.contactPerson.lastname?.trim()} />
                                </Stack>
                                <TextField fullWidth margin="normal" label="Contact telephone" name="telephone" value={farm?.telephone ?? ''} onChange={handleChange} error={!farm?.telephone?.trim()} />
                                <TextField fullWidth margin="normal" label="VAT ID" name="vatID" value={farm?.vatID ?? ''} onChange={handleChange} error={!farm?.vatID?.trim()} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Region" name="address.adminUnitL1" value={farm?.address.adminUnitL1 ?? ''} onChange={handleChange} error={!farm?.address.adminUnitL1?.trim()} />
                                    <TextField fullWidth margin="normal" label="Subregion" name="address.adminUnitL2" value={farm?.address.adminUnitL2 ?? ''} onChange={handleChange} error={!farm?.address.adminUnitL2?.trim()} />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Address area" name="address.addressArea" value={farm?.address.addressArea ?? ''} onChange={handleChange} error={!farm?.address.addressArea?.trim()} />
                                    <TextField fullWidth margin="normal" label="Municipality" name="address.municipality" value={farm?.address.municipality ?? ''} onChange={handleChange} error={!farm?.address.municipality?.trim()} />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Community" name="address.community" value={farm?.address.community ?? ''} onChange={handleChange} error={!farm?.address.community?.trim()} />
                                    <TextField fullWidth margin="normal" label="Locator name" name="address.locatorName" value={farm?.address.locatorName ?? ''} onChange={handleChange} error={!farm?.address.locatorName?.trim()} />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            loading={loading}
                            loadingPosition="start"
                            disabled={isFormInvalid}
                            onClick={handleEdit}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            loading={loading}
                            loadingPosition="start"
                            onClick={() => {
                                showDialog({
                                    title: `Are you sure you want to delete this farm?`,
                                    variant: 'yes-no',
                                    children: <></>
                                });
                            }}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>
            }
            <GenericDialog {...dialogProps} onClose={handleCloseDialog} onYes={handleDelete} />
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default FarmPage;