import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmModel } from "@models/Farm";
import { FarmParcelModel } from "@models/FarmParcel";
import { Box, Button, Card, CardContent, Checkbox, FormControlLabel, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import useDialog from "@hooks/useDialog";
import { ServiceContextType } from "@layouts/services/FarmCalendarLayout";
import WKTPolygonMap from "@components/shared/WKTPolygonMap/WKTPolygonMap";
import { useSession } from "@contexts/SessionContext";
import { generateFieldNotebook } from "@utils/generateReport";

const REQUIRED_KEYS = new Set<string>([
    'identifier',
    'farm',
    'hasGeometry.asWKT',
    'location.lat',
    'location.long',
    'validFrom',
    'validTo',
    'inRegion',
    'hasToponym',
    'area',
]);

const isReq = (key: string) => REQUIRED_KEYS.has(key);

const WineryPage = () => {
    const { actions } = useOutletContext<ServiceContextType>();
    const canEdit = actions.includes('edit');
    const canDelete = actions.includes('delete');

    const { session } = useSession();

    const [winery, setWinery] = useState<FarmParcelModel>();
    const [title, setTitle] = useState<string>('');

    const [selectedFarm, setSelectedFarm] = useState<string>('');
    const [notebookLoading, setNotebookLoading] = useState<boolean>(false);

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
            showSnackbar('error', 'Error loading winery');
        }
    }, [error])

    useEffect(() => {
        if (editError) {
            showSnackbar('error', 'Error editing winery');
        }
    }, [editError])

    useEffect(() => {
        if (deleteError) {
            showSnackbar('error', 'Error deleting winery');
        }
    }, [deleteError])

    useEffect(() => {
        if (response) {
            setWinery(response);
            setTitle(response.identifier);
            setSelectedFarm(response.farm["@id"].split(':')[3]);
        }
    }, [response])

    const navigate = useNavigate();
    useEffect(() => {
        if (editResponse) {
            navigate("/assets/wineries");
        }
    }, [editResponse])

    const handleDelete = async () => {
        await deleteFetchData();
        navigate("/assets/wineries");
    };

    const handleEdit = () => {
        if (!winery) return;
        const body = JSON.parse(JSON.stringify(winery)) as FarmParcelModel;
        // Ensure category remains 'Winery'
        body.category = 'Winery';
        if (typeof body.depiction === 'string' && !body.depiction.trim()) body.depiction = null;
        editFetchData({ body });
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

        setWinery(prev => {
            if (!prev) return undefined;

            const newState = JSON.parse(JSON.stringify(prev)) as FarmParcelModel;
            let currentLevel: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel = currentLevel[keys[i]];
            }

            let finalValue: string | number | boolean | null = type === 'checkbox' ? checked : value;
            if (isNumericField) {
                finalValue = value === '' ? null : parseFloat(value);
            }

            currentLevel[keys[keys.length - 1]] = finalValue;

            return newState;
        });
    };

    const handleGeometryChange = (wkt: string) => {
        setWinery(prev => {
            if (!prev) return undefined;
            return { ...prev, hasGeometry: { ...prev.hasGeometry, asWKT: wkt } };
        });
    };

    const fieldEmpty = (key: string): boolean => {
        if (!winery) return true;
        switch (key) {
            case 'identifier': return !winery.identifier?.trim();
            case 'farm': return !selectedFarm;
            case 'hasGeometry.asWKT': return !winery.hasGeometry?.asWKT;
            case 'location.lat': return winery.location.lat == null || Number.isNaN(winery.location.lat);
            case 'location.long': return winery.location.long == null || Number.isNaN(winery.location.long);
            case 'validFrom': return !winery.validFrom;
            case 'validTo': return !winery.validTo;
            case 'inRegion': return !winery.inRegion?.trim();
            case 'hasToponym': return !winery.hasToponym?.trim();
            case 'area': return winery.area == null || winery.area === '' || Number.isNaN(winery.area as any);
            default: return false;
        }
    };

    const isFormInvalid = Array.from(REQUIRED_KEYS).some(k => fieldEmpty(k));

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
                                {winery && <GenericSelect<FarmModel>
                                    canEdit={canEdit}
                                    endpoint='proxy/farmcalendar/api/v1/Farm/?format=json'
                                    label='Selected farm'
                                    required={isReq('farm')}
                                    error={isReq('farm') && fieldEmpty('farm')}
                                    selectedValue={selectedFarm}
                                    setSelectedValue={setSelectedFarm}
                                    getOptionLabel={item => `${item.name}`}
                                    getOptionValue={item => item["@id"].split(':')[3]}>
                                </GenericSelect>}
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" label="Winery identifier" name="identifier" value={winery?.identifier ?? ''} onChange={handleChange} required={isReq('identifier')} error={isReq('identifier') && fieldEmpty('identifier')} />
                                    <TextField fullWidth margin="normal" label="Winery type" name="category" value="Winery" disabled />
                                </Stack>
                                <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" multiline rows={3} label="Winery description" name="description" value={winery?.description ?? ''} onChange={handleChange} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" label="Valid from" name="validFrom" value={winery?.validFrom ?? ''} onChange={handleChange} disabled required={isReq('validFrom')} error={isReq('validFrom') && fieldEmpty('validFrom')} />
                                    <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" label="Valid to" name="validTo" value={winery?.validTo ?? ''} onChange={handleChange} disabled required={isReq('validTo')} error={isReq('validTo') && fieldEmpty('validTo')} />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" label="Region" name="inRegion" value={winery?.inRegion ?? ''} onChange={handleChange} required={isReq('inRegion')} error={isReq('inRegion') && fieldEmpty('inRegion')} />
                                    <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" label="Toponym" name="hasToponym" value={winery?.hasToponym ?? ''} onChange={handleChange} required={isReq('hasToponym')} error={isReq('hasToponym') && fieldEmpty('hasToponym')} />
                                </Stack>
                                <Stack flexWrap={"wrap"} direction={'row'} spacing={3} alignItems="center">
                                    <FormControlLabel control={<Checkbox disableRipple={!canEdit} name="isNitroArea" checked={!!winery?.isNitroArea} onChange={canEdit ? handleChange : () => {}} />} label="Nitro area" />
                                    <FormControlLabel control={<Checkbox disableRipple={!canEdit} name="isNatura2000Area" checked={!!winery?.isNatura2000Area} onChange={canEdit ? handleChange : () => {}} />} label="Natura 2000 area" />
                                    <FormControlLabel control={<Checkbox disableRipple={!canEdit} name="isPdopgArea" checked={!!winery?.isPdopgArea} onChange={canEdit ? handleChange : () => {}} />} label="PDOPG area" />
                                    <FormControlLabel control={<Checkbox disableRipple={!canEdit} name="isIrrigated" checked={!!winery?.isIrrigated} onChange={canEdit ? handleChange : () => {}} />} label="Irrigated" />
                                    <FormControlLabel control={<Checkbox disableRipple={!canEdit} name="isCultivatedInLevels" checked={!!winery?.isCultivatedInLevels} onChange={canEdit ? handleChange : () => {}} />} label="Cultivated in levels" />
                                    <FormControlLabel control={<Checkbox disableRipple={!canEdit} name="isGroundSlope" checked={!!winery?.isGroundSlope} onChange={canEdit ? handleChange : () => {}} />} label="Ground slope" />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField slotProps={{ input: { readOnly: !canEdit }, htmlInput: { step: 0.01 } }} fullWidth margin="normal" label="Area (sq. meters)" name="area" value={winery?.area ?? ''} type="number" onChange={handleChange} required={isReq('area')} error={isReq('area') && fieldEmpty('area')} />
                                    <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" label="Image or map URL" name="depiction" value={winery?.depiction ?? ''} onChange={handleChange} />
                                </Stack>
                                <TextField slotProps={{ input: { readOnly: !canEdit }, htmlInput: { step: 0.01 } }} fullWidth margin="normal" label="Irrigation flow (units)" name="hasIrrigationFlow" value={winery?.hasIrrigationFlow ?? ''} type="number" onChange={handleChange} />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" label="Latitude" name="location.lat" value={winery?.location.lat ?? ''} type="number" onChange={handleChange} required={isReq('location.lat')} error={isReq('location.lat') && fieldEmpty('location.lat')} />
                                    <TextField slotProps={{ input: { readOnly: !canEdit } }} fullWidth margin="normal" label="Longitude" name="location.long" value={winery?.location.long ?? ''} type="number" onChange={handleChange} required={isReq('location.long')} error={isReq('location.long') && fieldEmpty('location.long')} />
                                </Stack>
                                <Stack direction={'column'} spacing={1}>
                                    <Typography variant="subtitle2" color={isReq('hasGeometry.asWKT') && fieldEmpty('hasGeometry.asWKT') ? 'error' : undefined}>
                                        Winery boundary{isReq('hasGeometry.asWKT') ? ' *' : ''}
                                    </Typography>
                                    <WKTPolygonMap
                                        value={winery?.hasGeometry?.asWKT ?? ''}
                                        onChange={handleGeometryChange}
                                        readOnly={!canEdit}
                                        center={winery?.location}
                                    />
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
                            disabled={isFormInvalid || !canEdit}
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
                            disabled={!canDelete}
                            onClick={() => {
                                showDialog({
                                    title: `Are you sure you want to delete this winery?`,
                                    variant: 'yes-no',
                                    children: <></>
                                });
                            }}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<InsertDriveFileIcon />}
                            loading={notebookLoading}
                            loadingPosition="start"
                            disabled={!id || !session?.user?.token}
                            onClick={async () => {
                                if (!session?.user?.token || !id) return;
                                setNotebookLoading(true);
                                try {
                                    await generateFieldNotebook(session.user.token, { parcel_id: id }, null);
                                } catch (e: any) {
                                    showSnackbar('error', e?.message ?? 'Error generating field notebook');
                                } finally {
                                    setNotebookLoading(false);
                                }
                            }}
                        >
                            Download field notebook
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

export default WineryPage;
