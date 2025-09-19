import { Box, Button, Card, CardContent, IconButton, TextField, Typography, Stack } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useState, useEffect } from "react";
import { DiseaseActionsCRUDProps } from "./DiseaseCRUDActions.types";
import { DiseaseModel } from "@models/Disease";
import useFetch from "@hooks/useFetch";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useSnackbar from "@hooks/useSnackbar";

const createEmptyDisease = () => ({
    id: '',
    name: '',
    description: '',
    eppo_code: '',
    base_gdd: NaN,
    gdd_points: [
        {
            id: 0,
            start: NaN,
            end: NaN,
            descriptor: ''
        }
    ]
});

const DiseaseCRUDActions: React.FC<DiseaseActionsCRUDProps> = ({ disease, onAction }) => {
    const [formData, setFormData] = useState<DiseaseModel | undefined>();

    useEffect(() => {
        setFormData(disease || createEmptyDisease());
    }, [disease]);

    const handleAddGddPoint = () => {
        if (!formData?.gdd_points) return;
        const lastPoint = formData.gdd_points[formData.gdd_points.length - 1];
        if (isNaN(lastPoint.end)) return;

        const newPoint: DiseaseModel['gdd_points'][0] = {
            id: Date.now(),
            start: lastPoint.end,
            end: NaN,
            descriptor: '',
        };

        setFormData({ ...formData, gdd_points: [...formData.gdd_points, newPoint] });
    };

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    const { fetchData, response, error, loading } = useFetch<any>(
        `proxy/pdm/api/v1/disease/`,
        {
            method: disease ? 'PUT' : 'POST',
            body: formData
        }
    );

    useEffect(() => {
        if (response) {
            onAction && onAction();
            showSnackbar('success', disease ? "Disease edited successfully" : "Disease added successfully");
        }
    }, [response]);

    useEffect(() => {
        if (error) {
            showSnackbar('error', "An error occurred");
        }
    }, [error]);

    const handleRemoveGddPoint = () => {
        if (!formData?.gdd_points || formData.gdd_points.length <= 1) return;
        const updatedGddPoints = formData.gdd_points.slice(0, -1);
        setFormData({ ...formData, gdd_points: updatedGddPoints });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumericField = name === 'base_gdd';
        const finalValue = isNumericField ? parseFloat(value) : value;
        setFormData(prev => prev ? { ...prev, [name]: finalValue } : undefined);
    };

    const handleGddPointChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!formData) return;

        const { name, value } = e.target;
        const isNumericField = name === 'start' || name === 'end';
        const finalValue = isNumericField ? parseFloat(value) : value;

        let updatedGddPoints = formData.gdd_points.map((point, i) =>
            i === index ? { ...point, [name]: finalValue } : point
        );

        if (name === 'end' && index < updatedGddPoints.length - 1) {
            updatedGddPoints[index + 1].start = finalValue as number;
        }

        setFormData({ ...formData, gdd_points: updatedGddPoints });
    };

    const handleAction = () => {
        console.log("Form Data:", formData);
        fetchData();
    };

    if (!formData) {
        return null;
    }

    const lastGddPoint = formData.gdd_points[formData.gdd_points.length - 1];
    const isAddDisabled = !lastGddPoint || isNaN(lastGddPoint.end);

    const isFormInvalid =
        !formData.name?.trim() ||
        !formData.description?.trim() ||
        !formData.eppo_code?.trim() ||
        isNaN(formData.base_gdd) ||
        formData.gdd_points.some(gddp => {
            const isEndValueError = !isNaN(gddp.start) && !isNaN(gddp.end) && gddp.end <= gddp.start;
            return isNaN(gddp.start) || gddp.start < 0 || isNaN(gddp.end) || isEndValueError || !gddp.descriptor?.trim();
        });

    return (
        <>
            <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Stack direction={'column'} spacing={2} >
                    <TextField fullWidth margin="normal" label="Disease Name" name="name" value={formData.name ?? ''} onChange={handleChange} error={!formData.name?.trim()} />
                    <TextField fullWidth margin="normal" label="Disease Description" name="description" value={formData.description ?? ''} onChange={handleChange} error={!formData.description?.trim()} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField fullWidth margin="normal" label="EPPO Code" name="eppo_code" value={formData.eppo_code ?? ''} onChange={handleChange} error={!formData.eppo_code?.trim()} />
                        <TextField fullWidth margin="normal" label="Base GDD" name="base_gdd" type="number" value={isNaN(formData.base_gdd) ? '' : formData.base_gdd} onChange={handleChange} error={isNaN(formData.base_gdd)} />
                    </Stack>
                </Stack>

                <Typography variant="h6">GDD Points</Typography>

                {formData.gdd_points.map((gddp, index) => {
                    const isLastPoint = index === formData.gdd_points.length - 1;
                    const shouldShowRemoveButton = isLastPoint && formData.gdd_points.length > 1;
                    const isEndValueError = !isNaN(gddp.start) && !isNaN(gddp.end) && gddp.end <= gddp.start;

                    return (
                        <Card key={gddp.id} sx={{ backgroundColor: '#f9f9f9' }}>
                            <CardContent>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField label="From" name="start" type="number" value={isNaN(gddp.start) ? '' : gddp.start} onChange={(e) => handleGddPointChange(index, e)} disabled={index > 0 || formData.gdd_points.length > 1} error={isNaN(gddp.start) || gddp.start < 0} />
                                        <TextField label="To" name="end" type="number" value={isNaN(gddp.end) ? '' : gddp.end} onChange={(e) => handleGddPointChange(index, e)} disabled={!isLastPoint} error={isNaN(gddp.end) || isEndValueError} />
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                                        <TextField fullWidth label="Descriptor" name="descriptor" value={gddp.descriptor ?? ''} onChange={(e) => handleGddPointChange(index, e)} sx={{ flexGrow: 1 }} error={!gddp.descriptor?.trim()} />
                                        {shouldShowRemoveButton && (<IconButton aria-label="remove" onClick={handleRemoveGddPoint}><RemoveCircleOutlineIcon /></IconButton>)}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddGddPoint} disabled={isAddDisabled}>
                        Add GDD Point
                    </Button>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        loading={loading}
                        loadingPosition="start"
                        disabled={isFormInvalid}
                        onClick={handleAction}
                    >
                        {disease ? 'Save Changes' : 'Add Disease'}
                    </Button>
                </Box>
            </Box>
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    );
};

export default DiseaseCRUDActions;