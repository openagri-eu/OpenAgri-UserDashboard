import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmModel } from "@models/Farm";
import { FarmParcelModel } from "@models/FarmParcel";
import { Box, Button, Card, CardContent, Checkbox, FormControlLabel, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import useDialog from "@hooks/useDialog";

const FarmParcelPage = () => {
    const [parcel, setParcel] = useState<FarmParcelModel>();
    const [title, setTitle] = useState<string>('');

    const [selectedFarm, setSelectedFarm] = useState<string>('');

    const { id } = useParams();
    const { fetchData, loading, response, error } = useFetch<FarmParcelModel>(
        `proxy/farmcalendar/api/v1/FarmParcels/${id}/?format=json`,
        {
            method: 'GET',
        }
    );

    const { fetchData: editFetchData, response: editResponse, error: editError } = useFetch<any>(
        `proxy/farmcalendar/api/v1/FarmParcels/${id}/?format=json`,
        {
            method: 'PATCH',
        }
    );

    const { fetchData: deleteFetchData, error: deleteError } = useFetch<any>(
        `proxy/farmcalendar/api/v1/FarmParcels/${id}/?format=json`,
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
            showSnackbar('error', 'Error loading parcel');
        }
    }, [error])

    useEffect(() => {
        if (editError) {
            showSnackbar('error', 'Error editing parcel');
        }
    }, [editError])

    useEffect(() => {
        if (deleteError) {
            showSnackbar('error', 'Error deleting parcel');
        }
    }, [deleteError])

    useEffect(() => {
        if (response) {
            setParcel(response);
            setTitle(response.identifier);
            setSelectedFarm(response.farm["@id"].split(':')[3]);
        }
    }, [response])

    const navigate = useNavigate();
    useEffect(() => {
        if (editResponse) {
            navigate("/farm-locations/farm-parcels");
        }
    }, [editResponse])

    const handleDelete = async () => {
        await deleteFetchData();
        navigate("/farm-locations/farm-parcels");
    };

    const handleEdit = () => {
        editFetchData({
            body: parcel
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const keys = name.split('.');

        const isNumericField =
            name === 'area' ||
            name === 'hasIrrigationFlow' ||
            name === 'location.lat' ||
            name === "location.long";

        setParcel(prev => {
            if (!prev) return undefined;

            const newState = JSON.parse(JSON.stringify(prev)) as FarmParcelModel;
            let currentLevel: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel = currentLevel[keys[i]];
            }

            let finalValue: string | number | boolean = type === 'checkbox' ? checked : value;
            if (isNumericField) {
                finalValue = parseFloat(value);
            }

            currentLevel[keys[keys.length - 1]] = finalValue;

            return newState;
        });
    };

    const isFormInvalid =
        !parcel?.identifier?.trim() ||
        !parcel.category ||
        !parcel.location.lat ||
        !parcel.location.long ||
        !selectedFarm

    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !(loading || error) &&
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <Typography variant={'h4'}>{title}</Typography>
                    <Card>
                        <CardContent>
                            <Stack direction={'column'} spacing={2} >
                                {parcel && <GenericSelect<FarmModel>
                                    endpoint='proxy/farmcalendar/api/v1/Farm/?format=json'
                                    label='Selected farm *'
                                    selectedValue={selectedFarm}
                                    setSelectedValue={setSelectedFarm}
                                    getOptionLabel={item => `${item.name}`}
                                    getOptionValue={item => item["@id"].split(':')[3]}>
                                </GenericSelect>}
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Parcel identifier" name="identifier" value={parcel?.identifier ?? ''} required onChange={handleChange} error={!parcel?.identifier.trim()} />
                                    <TextField fullWidth margin="normal" label="Parcel type" name="category" value={parcel?.category ?? ''} required onChange={handleChange} error={!parcel?.category.trim()} />
                                </Stack>
                                <TextField fullWidth margin="normal" multiline rows={3} label="Parcel description" name="description" value={parcel?.description ?? ''} onChange={handleChange} error={!parcel?.description?.trim()} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Valid from" name="validFrom" value={parcel?.validFrom ?? ''} onChange={handleChange} disabled />
                                    <TextField fullWidth margin="normal" label="Valid to" name="validTo" value={parcel?.validTo ?? ''} onChange={handleChange} disabled />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Region" name="inRegion" value={parcel?.inRegion ?? ''} onChange={handleChange} />
                                    <TextField fullWidth margin="normal" label="Toponym" name="hasToponym" value={parcel?.hasToponym ?? ''} onChange={handleChange} />
                                </Stack>
                                <Stack flexWrap={"wrap"} direction={'row'} spacing={3} alignItems="center">
                                    <FormControlLabel control={<Checkbox name="isNitroArea" checked={!!parcel?.isNitroArea} onChange={handleChange} />} label="Nitro area" />
                                    <FormControlLabel control={<Checkbox name="isNatura2000Area" checked={!!parcel?.isNatura2000Area} onChange={handleChange} />} label="Natura 2000 area" />
                                    <FormControlLabel control={<Checkbox name="isPdopgArea" checked={!!parcel?.isPdopgArea} onChange={handleChange} />} label="PDOPG area" />
                                    <FormControlLabel control={<Checkbox name="isIrrigated" checked={!!parcel?.isIrrigated} onChange={handleChange} />} label="Irrigated" />
                                    <FormControlLabel control={<Checkbox name="isCultivatedInLevels" checked={!!parcel?.isCultivatedInLevels} onChange={handleChange} />} label="Cultivated in levels" />
                                    <FormControlLabel control={<Checkbox name="isGroundSlope" checked={!!parcel?.isGroundSlope} onChange={handleChange} />} label="Ground slope" />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Area (sq. meters)" name="area" value={parcel?.area ?? ''} type="number" onChange={handleChange} />
                                    <TextField fullWidth margin="normal" label="Image or map URL" name="depiction" value={parcel?.depiction ?? ''} onChange={handleChange} />
                                </Stack>
                                <TextField fullWidth margin="normal" label="Irrigation flow (units)" name="hasIrrigationFlow" value={parcel?.hasIrrigationFlow ?? ''} type="number" onChange={handleChange} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField fullWidth margin="normal" label="Latitude" name="location.lat" value={parcel?.location.lat ?? ''} type="number" onChange={handleChange} required error={!parcel?.location.lat} />
                                    <TextField fullWidth margin="normal" label="Longitude" name="location.long" value={parcel?.location.long ?? ''} type="number" onChange={handleChange} required error={!parcel?.location.long} />
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
                                    title: `Are you sure you want to delete this parcel?`,
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

export default FarmParcelPage;