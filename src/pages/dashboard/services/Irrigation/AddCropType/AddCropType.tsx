import { Box, Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import { CropTypeModel } from "@models/CropType";
import { AddCropTypeProps } from "./AddCropType.types";

const REQUIRED_KEYS = new Set<string>(['crop', 'kc_init', 'kc_mid', 'kc_end']);
const isReq = (k: string) => REQUIRED_KEYS.has(k);

const KC_MIN = 0;
const KC_MAX = 2;

const inKcRange = (v: number | null) =>
    v != null && !Number.isNaN(v) && v > KC_MIN && v < KC_MAX;

type CropCreate = Omit<CropTypeModel, 'id'>;

const emptyForm: CropCreate = {
    crop: '',
    kc_init: NaN,
    kc_mid: NaN,
    kc_end: NaN,
};

const AddCropType: React.FC<AddCropTypeProps> = ({ onAction, existingNames = [] }) => {
    const [formData, setFormData] = useState<CropCreate>({ ...emptyForm });

    const { fetchData, response, error, loading } = useFetch<any>(
        'proxy/irrigation/api/v1/eto/crop-types/',
        { method: 'POST' }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        if (response) {
            showSnackbar('success', 'Crop type added successfully');
            setFormData({ ...emptyForm });
            onAction && onAction();
        }
    }, [response]);

    useEffect(() => {
        if (error) showSnackbar('error', 'An error occurred');
    }, [error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'crop' ? value : (value === '' ? NaN : parseFloat(value)),
        }));
    };

    const isDuplicate = existingNames.includes(formData.crop.trim());

    const fieldEmpty = (key: string) => {
        switch (key) {
            case 'crop': return !formData.crop.trim();
            case 'kc_init': return !inKcRange(formData.kc_init);
            case 'kc_mid': return !inKcRange(formData.kc_mid);
            case 'kc_end': return !inKcRange(formData.kc_end);
            default: return false;
        }
    };

    const isFormInvalid = Array.from(REQUIRED_KEYS).some(k => fieldEmpty(k)) || isDuplicate;

    const handlePost = () => {
        fetchData({ body: { ...formData, crop: formData.crop.trim() } });
    };

    return (
        <Box display={'flex'} flexDirection={'column'} gap={2}>
            <Stack direction={'column'} spacing={2}>
                <TextField
                    fullWidth margin="normal" label="Crop name" name="crop"
                    value={formData.crop} onChange={handleChange}
                    required={isReq('crop')}
                    error={(isReq('crop') && fieldEmpty('crop')) || isDuplicate}
                    helperText={isDuplicate ? 'Crop name already exists' : ''}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        fullWidth margin="normal" label="Kc init (0 < x < 2)" name="kc_init" type="number"
                        slotProps={{ htmlInput: { step: 0.01, min: 0, max: 2 } }}
                        value={Number.isNaN(formData.kc_init) ? '' : formData.kc_init}
                        onChange={handleChange}
                        required={isReq('kc_init')}
                        error={isReq('kc_init') && fieldEmpty('kc_init')}
                    />
                    <TextField
                        fullWidth margin="normal" label="Kc mid (0 < x < 2)" name="kc_mid" type="number"
                        slotProps={{ htmlInput: { step: 0.01, min: 0, max: 2 } }}
                        value={Number.isNaN(formData.kc_mid) ? '' : formData.kc_mid}
                        onChange={handleChange}
                        required={isReq('kc_mid')}
                        error={isReq('kc_mid') && fieldEmpty('kc_mid')}
                    />
                    <TextField
                        fullWidth margin="normal" label="Kc end (0 < x < 2)" name="kc_end" type="number"
                        slotProps={{ htmlInput: { step: 0.01, min: 0, max: 2 } }}
                        value={Number.isNaN(formData.kc_end) ? '' : formData.kc_end}
                        onChange={handleChange}
                        required={isReq('kc_end')}
                        error={isReq('kc_end') && fieldEmpty('kc_end')}
                    />
                </Stack>
            </Stack>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained" color="primary"
                    startIcon={<AddIcon />}
                    loading={loading}
                    loadingPosition="start"
                    disabled={isFormInvalid}
                    onClick={handlePost}
                >
                    Add crop type
                </Button>
            </Box>
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </Box>
    );
};

export default AddCropType;
