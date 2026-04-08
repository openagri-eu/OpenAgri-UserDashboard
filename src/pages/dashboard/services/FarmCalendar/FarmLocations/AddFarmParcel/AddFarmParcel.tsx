import { Box, Button, Checkbox, FormControlLabel, Stack, TextField } from "@mui/material";
import { AddFarmParcelProps } from "./AddFarmParcel.types";
import { useEffect, useState } from "react";
import { FarmParcelModel } from "@models/FarmParcel";
import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import { FarmModel } from "@models/Farm";
import AddIcon from '@mui/icons-material/Add';
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";

const AddFarmParcel: React.FC<AddFarmParcelProps> = ({ onAction }) => {

    const [selectedFarm, setSelectedFarm] = useState<string>('');

    const [formData, setFormData] = useState<FarmParcelModel | undefined>({
        '@type': '',
        '@id': '',
        'status': 0,
        'deleted_at': null,
        'created_at': '',
        'updated_at': '',
        'identifier': '',
        'description': '',
        'validFrom': new Date().toISOString(),
        'validTo': new Date().toISOString(),
        'area': '',
        'hasIrrigationFlow': '',
        'category': '',
        'inRegion': '',
        'hasToponym': '',
        'isNitroArea': false,
        'isNatura2000Area': false,
        'isPdopgArea': false,
        'isIrrigated': false,
        'isCultivatedInLevels': false,
        'isGroundSlope': false,
        'depiction': null,
        'hasGeometry': {
            '@id': '',
            '@type': '',
            'asWKT': 'POLYGON((0 0, 0 0))'
        },
        'location': {
            '@id': '',
            '@type': '',
            'lat': null,
            'long': null
        },
        'hasAgriCrop': [],
        'farm': {
            '@type': 'Farm',
            '@id': '',
        }
    });

    const { fetchData, response, error, loading } = useFetch<any>(
        `proxy/farmcalendar/api/v1/FarmParcels/`,
        {
            method: 'POST'
        }
    );

    const handlePost = () => {
        let body = { ...formData };
        (body.farm as { '@id': string })['@id'] = `urn:farmcalendar:Farm:${selectedFarm}`;

        console.log("Form Data:", body);

        fetchData({ body: body });
    };

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();


    useEffect(() => {
        if (response) {
            onAction && onAction();
            showSnackbar('success', "Pest added successfully");
        }
    }, [response]);

    useEffect(() => {
        if (error) {
            showSnackbar('error', "An error occurred");
        }
    }, [error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const keys = name.split('.');

        const isNumericField =
            name === 'area' ||
            name === 'hasIrrigationFlow' ||
            name === 'location.lat' ||
            name === "location.long";

        setFormData(prev => {
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
        !formData?.identifier?.trim() ||
        !formData.category ||
        !formData.location.lat ||
        !formData.location.long ||
        !selectedFarm

    return (
        <>
            <Box display={'flex'} flexDirection={'column'} gap={2}>

                <Stack direction={'column'} spacing={2} >
                    {<GenericSelect<FarmModel>
                        endpoint='proxy/farmcalendar/api/v1/Farm/?format=json'
                        label='Selected farm *'
                        selectedValue={selectedFarm}
                        setSelectedValue={setSelectedFarm}
                        getOptionLabel={item => `${item.name}`}
                        getOptionValue={item => item["@id"].split(':')[3]}>
                    </GenericSelect>}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField fullWidth margin="normal" label="Parcel identifier" name="identifier" value={formData?.identifier ?? ''} required onChange={handleChange} error={!formData?.identifier.trim()} />
                        <TextField fullWidth margin="normal" label="Parcel type" name="category" value={formData?.category ?? ''} required onChange={handleChange} error={!formData?.category.trim()} />
                    </Stack>
                    <TextField fullWidth margin="normal" multiline rows={3} label="Parcel description" name="description" value={formData?.description ?? ''} onChange={handleChange} error={!formData?.description?.trim()} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField fullWidth margin="normal" label="Valid from" name="validFrom" value={formData?.validFrom ?? ''} onChange={handleChange} disabled />
                        <TextField fullWidth margin="normal" label="Valid to" name="validTo" value={formData?.validTo ?? ''} onChange={handleChange} disabled />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField fullWidth margin="normal" label="Region" name="inRegion" value={formData?.inRegion ?? ''} onChange={handleChange} />
                        <TextField fullWidth margin="normal" label="Toponym" name="hasToponym" value={formData?.hasToponym ?? ''} onChange={handleChange} />
                    </Stack>
                    <Stack flexWrap={"wrap"} direction={'row'} spacing={3} alignItems="center">
                        <FormControlLabel control={<Checkbox name="isNitroArea" checked={!!formData?.isNitroArea} onChange={handleChange} />} label="Nitro area" />
                        <FormControlLabel control={<Checkbox name="isNatura2000Area" checked={!!formData?.isNatura2000Area} onChange={handleChange} />} label="Natura 2000 area" />
                        <FormControlLabel control={<Checkbox name="isPdopgArea" checked={!!formData?.isPdopgArea} onChange={handleChange} />} label="PDOPG area" />
                        <FormControlLabel control={<Checkbox name="isIrrigated" checked={!!formData?.isIrrigated} onChange={handleChange} />} label="Irrigated" />
                        <FormControlLabel control={<Checkbox name="isCultivatedInLevels" checked={!!formData?.isCultivatedInLevels} onChange={handleChange} />} label="Cultivated in levels" />
                        <FormControlLabel control={<Checkbox name="isGroundSlope" checked={!!formData?.isGroundSlope} onChange={handleChange} />} label="Ground slope" />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField fullWidth margin="normal" label="Area (sq. meters)" name="area" value={formData?.area ?? ''} type="number" onChange={handleChange} />
                        <TextField fullWidth margin="normal" label="Image or map URL" name="depiction" value={formData?.depiction ?? ''} onChange={handleChange} />
                    </Stack>
                    <TextField fullWidth margin="normal" label="Irrigation flow (units)" name="hasIrrigationFlow" value={formData?.hasIrrigationFlow ?? ''} type="number" onChange={handleChange} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField fullWidth margin="normal" label="Latitude" name="location.lat" value={formData?.location.lat ?? ''} type="number" onChange={handleChange} required error={!formData?.location.lat} />
                        <TextField fullWidth margin="normal" label="Longitude" name="location.long" value={formData?.location.long ?? ''} type="number" onChange={handleChange} required error={!formData?.location.long} />
                    </Stack>
                </Stack>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        loading={loading}
                        loadingPosition="start"
                        disabled={isFormInvalid}
                        onClick={handlePost}
                    >
                        Save Changes
                    </Button>
                </Box>
                <GenericSnackbar
                    type={snackbarState.type}
                    message={snackbarState.message}
                    open={snackbarState.open}
                    onClose={closeSnackbar}
                />
            </Box>
        </>
    )
}

export default AddFarmParcel;
