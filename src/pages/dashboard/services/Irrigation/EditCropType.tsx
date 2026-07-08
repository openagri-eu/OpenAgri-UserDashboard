import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { CropTypeModel } from "@models/CropType";
import { Box, Button, Card, CardContent, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import SaveIcon from '@mui/icons-material/Save';
import { ServiceContextType } from "@layouts/services/IrrigationManagementLayout";

const REQUIRED_KEYS = new Set<string>(['crop', 'kc_init', 'kc_mid', 'kc_end']);
const isReq = (k: string) => REQUIRED_KEYS.has(k);

const KC_MIN = 0;
const KC_MAX = 2;
const inKcRange = (v: number | null | undefined) =>
    v != null && !Number.isNaN(v) && v > KC_MIN && v < KC_MAX;

const EditCropTypePage = () => {
    const { actions } = useOutletContext<ServiceContextType>();
    const canEdit = actions.includes('edit');

    const { id } = useParams();
    const cropId = id ?? '';

    const [formData, setFormData] = useState<CropTypeModel | undefined>();

    const { fetchData, loading, response, error } = useFetch<CropTypeModel>(
        `proxy/irrigation/api/v1/eto/crop-types/${cropId}/`,
        { method: 'GET', noCache: true }
    );

    const { fetchData: putFetchData, response: putResponse, error: putError, loading: putLoading } = useFetch<any>(
        `proxy/irrigation/api/v1/eto/crop-types/${cropId}/`,
        { method: 'PUT' }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (error) showSnackbar('error', 'Error loading crop type');
    }, [error]);

    useEffect(() => {
        if (putError) showSnackbar('error', 'Error saving crop type');
    }, [putError]);

    useEffect(() => {
        if (response) setFormData(response);
    }, [response]);

    useEffect(() => {
        if (putResponse) navigate('/crop-types');
    }, [putResponse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (!prev) return undefined;
            return {
                ...prev,
                [name]: name === 'crop' ? value : (value === '' ? NaN : parseFloat(value)),
            };
        });
    };

    const fieldEmpty = (key: string) => {
        if (!formData) return true;
        switch (key) {
            case 'crop': return !formData.crop.trim() || formData.crop.trim().length > 64;
            case 'kc_init': return !inKcRange(formData.kc_init);
            case 'kc_mid': return !inKcRange(formData.kc_mid);
            case 'kc_end': return !inKcRange(formData.kc_end);
            default: return false;
        }
    };

    const isFormInvalid = Array.from(REQUIRED_KEYS).some(k => fieldEmpty(k));

    const handleSave = () => {
        if (!formData) return;
        const { id: _id, ...rest } = formData;
        putFetchData({ body: { ...rest, crop: rest.crop.trim() } });
    };

    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {!(loading || error) && formData && (
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <Typography variant={'h4'}>{formData.crop}</Typography>
                    <Card>
                        <CardContent>
                            <Stack direction={'column'} spacing={2}>
                                <TextField
                                    slotProps={{ input: { readOnly: !canEdit } }}
                                    fullWidth margin="normal" label="Crop name" name="crop"
                                    value={formData.crop} onChange={handleChange}
                                    required={isReq('crop')}
                                    error={isReq('crop') && fieldEmpty('crop')}
                                    helperText={formData.crop.trim().length > 64 ? 'Max 64 characters' : ''}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <TextField
                                        slotProps={{ input: { readOnly: !canEdit }, htmlInput: { step: 0.01, min: 0, max: 2 } }}
                                        fullWidth margin="normal" label="Kc init (0 < x < 2)" name="kc_init" type="number"
                                        value={Number.isNaN(formData.kc_init) ? '' : formData.kc_init}
                                        onChange={handleChange}
                                        required={isReq('kc_init')}
                                        error={isReq('kc_init') && fieldEmpty('kc_init')}
                                    />
                                    <TextField
                                        slotProps={{ input: { readOnly: !canEdit }, htmlInput: { step: 0.01, min: 0, max: 2 } }}
                                        fullWidth margin="normal" label="Kc mid (0 < x < 2)" name="kc_mid" type="number"
                                        value={Number.isNaN(formData.kc_mid) ? '' : formData.kc_mid}
                                        onChange={handleChange}
                                        required={isReq('kc_mid')}
                                        error={isReq('kc_mid') && fieldEmpty('kc_mid')}
                                    />
                                    <TextField
                                        slotProps={{ input: { readOnly: !canEdit }, htmlInput: { step: 0.01, min: 0, max: 2 } }}
                                        fullWidth margin="normal" label="Kc end (0 < x < 2)" name="kc_end" type="number"
                                        value={Number.isNaN(formData.kc_end) ? '' : formData.kc_end}
                                        onChange={handleChange}
                                        required={isReq('kc_end')}
                                        error={isReq('kc_end') && fieldEmpty('kc_end')}
                                    />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained" color="primary"
                            startIcon={<SaveIcon />}
                            loading={putLoading}
                            loadingPosition="start"
                            disabled={isFormInvalid || !canEdit}
                            onClick={handleSave}
                        >
                            Save changes
                        </Button>
                    </Box>
                </Box>
            )}
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    );
};

export default EditCropTypePage;
