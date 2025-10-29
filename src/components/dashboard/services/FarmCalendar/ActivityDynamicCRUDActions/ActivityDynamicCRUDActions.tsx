import { BaseActivityModel } from "@models/FarmCalendarActivities";
import { ActivityDynamicCRUDActionsProps } from "./ActivityDynamicCRUDActions.types";
import { Box, Button, Card, CardContent, List, ListItem, ListItemText, Stack, TextField, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers";
import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import { FarmParcelModel } from "@models/FarmParcel";
import { FarmCropModel } from "@models/FarmCrop";

import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import useDialog from "@hooks/useDialog";
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";
import { AgriculturalMachine } from "@models/AgriculturalMachine";
import { PesticideModel } from "@models/Pesticide";

const ActivityDynamicCRUDActions = <T extends BaseActivityModel>({ activity, onAdd, onDelete, onSave, loading }: ActivityDynamicCRUDActionsProps<T>) => {

    const [formData, setFormData] = useState<T>(activity);
    const [selectedParcel, setSelectedParcel] = useState<string>('');
    const [selectedAgriCrop, setSelectedAgriCrop] = useState<string>('');
    const [selectedAgriMachines, setSelectedAgriMachines] = useState<string[]>([]);
    const [operatedOnCompostPile, setOperatedOnCompostPile] = useState<string>('');
    const [selectedPesticide, setSelectedPesticide] = useState<string>('');

    useEffect(() => {
        let parcelID: string | undefined;
        if ('hasAgriParcel' in formData) {
            parcelID = (formData as any).hasAgriParcel["@id"];
        } else if ('operatedOn' in formData) {
            parcelID = (formData as any).operatedOn["@id"];
        }
        if (parcelID) {
            const idParts = parcelID.split(':');
            setSelectedParcel(idParts[idParts.length - 1]);
        }

        let cropID: string | undefined;
        if ('hasAgriCrop' in formData) {
            cropID = (formData as any).hasAgriCrop["@id"];
        }
        if (cropID) {
            const idParts = cropID.split(':');
            setSelectedAgriCrop(idParts[idParts.length - 1]);
        }

        let agriMachinesIDs: string[] | undefined;
        if ('usesAgriculturalMachinery' in formData) {
            agriMachinesIDs = (formData as any).usesAgriculturalMachinery.map((m: any) => { return m["@id"].split(':')[3] });
        }
        if (agriMachinesIDs) {
            setSelectedAgriMachines(agriMachinesIDs);
        }

        let operatedOnCompostPile: string | undefined;
        if ('isOperatedOn' in formData) {
            operatedOnCompostPile = (formData as any).isOperatedOn["@id"];
        }
        if (operatedOnCompostPile) {
            const idParts = operatedOnCompostPile.split(':');
            setOperatedOnCompostPile(idParts[idParts.length - 1]);
        }

        let pesticideID: string | undefined;
        if ('usesPesticide' in formData) {
            pesticideID = (formData as any).usesPesticide["@id"];
        }
        if (pesticideID) {
            const idParts = pesticideID.split(':');
            setSelectedPesticide(idParts[idParts.length - 1]);
        }
    }, [formData]);

    const { dialogProps, showDialog } = useDialog();

    const handleCloseDialog = () => {
        dialogProps.onClose();
    };

    /** Field change handlers start */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');

        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev)) as T;

            let currentLevel: any = newState;
            try {
                for (let i = 0; i < keys.length - 1; i++) {
                    currentLevel = currentLevel[keys[i]];
                }
                const finalKey = keys[keys.length - 1];
                const isNumeric = typeof currentLevel[finalKey] === 'number';
                currentLevel[finalKey] = isNumeric ? parseFloat(value) || 0 : value;

            } catch (error) {
                console.error(`Error setting nested property "${name}":`, error);
                return prev;
            }
            return newState;
        });
    };

    const handleDateChange = (newValue: Dayjs | null, fieldName: string) => {
        const formattedValue = newValue ? newValue.toISOString() : null;
        setFormData(prev => ({ ...prev, [fieldName]: formattedValue } as T));
    };

    const handleOperatedOnCompostPile = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOperatedOnCompostPile(e.target.value);
    }
    /** Field change handlers end */

    /** -------------------------------------------------------------------------- */

    /** Field rendering helpers start */
    const renderDateFields = () => {
        return (
            <>
                {'hasStartDatetime' in formData && (
                    <DateTimePicker
                        label="Start datetime"
                        value={dayjs(formData.hasStartDatetime as string | Date | null)}
                        onChange={(val) => handleDateChange(val, 'hasStartDatetime')}
                    />
                )}
                {'phenomenonTime' in formData && (
                    <DateTimePicker
                        label="Start datetime"
                        value={dayjs(formData.phenomenonTime as string | Date | null)}
                        onChange={(val) => handleDateChange(val, 'phenomenonTime')}
                    />
                )}
                {'validFrom' in formData && (
                    <DateTimePicker
                        label="Start datetime"
                        value={dayjs(formData.validFrom as string | Date | null)}
                        onChange={(val) => handleDateChange(val, 'validFrom')}
                    />
                )}
                {'hasEndDatetime' in formData && (
                    <DateTimePicker
                        label="End datetime"
                        value={dayjs(formData.hasEndDatetime as string | Date | null)}
                        onChange={(val) => handleDateChange(val, 'hasEndDatetime')}
                    />
                )}
                {'validTo' in formData && (
                    <DateTimePicker
                        label="Start datetime"
                        value={dayjs(formData.validTo as string | Date | null)}
                        onChange={(val) => handleDateChange(val, 'validTo')}
                    />
                )}
            </>
        )
    }

    const renderAgentAndMachinery = () => {
        return (
            <>
                {'responsibleAgent' in formData && (
                    <TextField
                        fullWidth margin="normal" label="Responsible agent"
                        name="responsibleAgent"
                        value={formData.responsibleAgent ?? ''}
                        onChange={handleChange}
                        error={!(formData.responsibleAgent ? formData.responsibleAgent as string : '').trim()} />
                )}
                {'usesAgriculturalMachinery' in formData && (
                    <GenericSelect<AgriculturalMachine>
                        multiple={true}
                        endpoint='proxy/farmcalendar/api/v1/AgriculturalMachines/?format=json'
                        label='Agricultural machines'
                        getOptionLabel={item => `${item.name} (${item.model})`}
                        getOptionValue={item => item["@id"].split(':')[3]}
                        setSelectedValue={setSelectedAgriMachines}
                        selectedValue={selectedAgriMachines}
                    />
                )}
            </>
        )
    }

    const renderPartOfX = () => {
        return (
            <></>
        )
    }

    const renderSensorResultAndObservedProperty = () => {
        type SensorShape = { name: string };
        type ResultShape = { unit: string; hasValue: string };

        return (
            <>
                {'madeBySensor' in formData && (
                    <TextField
                        fullWidth margin="normal" label="Made by sensor"
                        name="madeBySensor.name"
                        value={(formData.madeBySensor as SensorShape).name ?? ''}
                        onChange={handleChange}
                        error={!(formData.madeBySensor as SensorShape).name?.trim()} />
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {'hasResult' in formData && (
                        <TextField
                            fullWidth margin="normal" label="Value"
                            name="hasResult.hasValue"
                            value={(formData.hasResult as ResultShape).hasValue ?? ''}
                            onChange={handleChange}
                            error={!(formData.hasResult as ResultShape).hasValue?.trim()} />
                    )}
                    {'hasResult' in formData && (
                        <TextField
                            fullWidth margin="normal" label="Value unit"
                            name="hasResult.unit"
                            value={(formData.hasResult as ResultShape).unit ?? ''}
                            onChange={handleChange}
                            error={!(formData.hasResult as ResultShape).unit?.trim()} />
                    )}
                </Stack>
                {'observedProperty' in formData && (
                    <TextField
                        fullWidth margin="normal" label="Observed property"
                        name="observedProperty"
                        value={formData.observedProperty ?? ''}
                        onChange={handleChange}
                        error={!(formData.observedProperty as string).trim()} />
                )}
            </>
        )
    }

    const renderSelectedCrop = () => {
        // TODO: filter if parcel is selected
        return (
            <>
                {'hasAgriCrop' in formData && (
                    <GenericSelect<FarmCropModel>
                        endpoint='proxy/farmcalendar/api/v1/FarmCrops/?format=json'
                        label='Crop'
                        selectedValue={selectedAgriCrop}
                        setSelectedValue={setSelectedAgriCrop}
                        getOptionLabel={item => `${item.name} - ${item.cropSpecies.name} - ${item.growth_stage}`}
                        getOptionValue={item => item["@id"].split(':')[3]}
                    />
                )}
            </>
        )
    }

    const renderHasArea = () => {
        return (
            <>
                {'hasArea' in formData && (
                    <TextField
                        fullWidth
                        label="Has area"
                        name="hasArea"
                        type="number"
                        value={isNaN(formData.hasArea as number) ? '' : formData.hasArea}
                        onChange={handleChange}
                        error={isNaN(formData.hasArea as number)} />
                )}
            </>
        )
    }

    const renderOperatedOnCompostPile = () => {
        return (
            <>
                {'isOperatedOn' in formData && (
                    <TextField
                        fullWidth margin="normal" label="Operated on compost pile"
                        name="isOperatedOn.@id"
                        value={operatedOnCompostPile}
                        onChange={handleOperatedOnCompostPile}
                        error={!operatedOnCompostPile.trim()} />
                )}
            </>
        )
    }

    const renderApplicationMethod = () => {
        return (
            <>
                {'hasApplicationMethod' in formData && (
                    <TextField
                        fullWidth margin="normal" label="Application method"
                        name="hasApplicationMethod"
                        value={formData.hasApplicationMethod}
                        onChange={handleChange}
                        error={!(formData.hasApplicationMethod as string).trim()} />
                )}
            </>
        )
    }

    const renderAppliedAmount = () => {
        type AppliedAmountShape = { unit: string, numericValue: number };

        return (
            <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {'hasAppliedAmount' in formData && (
                        <TextField
                            fullWidth label="Applied amount"
                            name="hasAppliedAmount.numericValue"
                            type="number"
                            value={isNaN((formData.hasAppliedAmount as AppliedAmountShape)['numericValue']) ?
                                '' : (formData.hasAppliedAmount as AppliedAmountShape)["numericValue"]}
                            onChange={handleChange}
                            error={isNaN((formData.hasAppliedAmount as AppliedAmountShape)['numericValue'])} />
                    )}
                    {'hasAppliedAmount' in formData && (
                        <TextField
                            fullWidth margin="normal" label="Applied amount unit"
                            name="hasAppliedAmount.unit"
                            value={(formData.hasAppliedAmount as AppliedAmountShape).unit ?? ''}
                            onChange={handleChange}
                            error={!(formData.hasAppliedAmount as AppliedAmountShape).unit?.trim()} />
                    )}
                </Stack>
            </>
        )
    }

    const renderPesticide = () => {
        // TODO: filter if parcel is selected
        return (
            <>
                {'usesPesticide' in formData && (
                    <GenericSelect<PesticideModel>
                        endpoint='proxy/farmcalendar/api/v1/Pesticides/?format=json'
                        label='Pesticide'
                        selectedValue={selectedPesticide}
                        setSelectedValue={setSelectedPesticide}
                        getOptionLabel={item => `${item.hasCommercialName} - ${item.hasActiveSubstance} - ${item.hasPreharvestInterval}`}
                        getOptionValue={item => item["@id"].split(':')[3]}
                    />
                )}
            </>
        )
    }

    const renderNestedActivities = () => {
        // TODO: finish
        const nestedActivities = [];
        if ('hasMeasurement' in formData) {
            nestedActivities.push(...(formData.hasMeasurement as any));
        }
        if ('hasNestedOperation' in formData) {
            nestedActivities.push(...(formData.hasNestedOperation as any));
        }
        return (
            <>
                {nestedActivities.length > 0 &&
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Nested activities</Typography>
                            <List dense={nestedActivities.length > 10}>
                                {nestedActivities.map((n: any) => {
                                    return <ListItem key={n["@id"]}>
                                        <ListItemText
                                            primary={n["@id"]}
                                        />
                                    </ListItem>
                                })}
                            </List>
                        </CardContent>
                    </Card>
                }
            </>
        )
    }
    /** Field rendering helpers end */

    /** -------------------------------------------------------------------------- */

    /** Button handler functions start */
    const prepPostAndPatch = () => {
        let body = { ...formData };
        if ('hasAgriParcel' in body) {
            (body.hasAgriParcel as { '@id': string })['@id'] = `urn:farmcalendar:Parcel:${selectedParcel}`;
        } else if ('operatedOn' in body) {
            (body.operatedOn as { '@id': string })['@id'] = `urn:farmcalendar:Parcel:${selectedParcel}`;
        }
        if ('hasAgriCrop' in body) {
            (body.hasAgriCrop as { '@id': string })['@id'] = `urn:farmcalendar:FarmCrop:${selectedAgriCrop}`;
        }
        if ('usesAgriculturalMachinery' in body) {
            (body.usesAgriculturalMachinery as string[]) = selectedAgriMachines;
        }
        if ('isOperatedOn' in body) {
            (body.isOperatedOn as { '@id': string })['@id'] = `urn:farmcalendar:CompostPile:${operatedOnCompostPile}`;
        }
        if ('usesPesticide' in body) {
            (body.usesPesticide as { '@id': string })['@id'] = `urn:farmcalendar:Pesticide:${selectedPesticide}`;
        }
        return body;
    }

    const handlePost = () => {
        onAdd && onAdd(prepPostAndPatch());
    };

    const handlePatch = () => {
        const body = prepPostAndPatch();

        console.log(body);

        onSave && onSave(body);
    }

    const handleDelete = () => {
        onDelete && onDelete();
    };
    /** Button handler functions end */

    return (
        <>
            <Card>
                <CardContent>
                    <Stack direction={'column'} spacing={2}>
                        <TextField
                            fullWidth margin="normal" label="Title" name="title"
                            value={formData.title ?? ''} onChange={handleChange}
                            error={!formData.title?.trim()}
                        />
                        {renderDateFields()}
                        <TextField
                            fullWidth margin="normal" multiline rows={4} label="Details" name="details"
                            value={formData.details ?? ''} onChange={handleChange}
                        />
                        {renderAgentAndMachinery()}
                        <GenericSelect<FarmParcelModel>
                            endpoint='proxy/farmcalendar/api/v1/FarmParcels/?format=json'
                            label='Parcel'
                            selectedValue={selectedParcel}
                            setSelectedValue={setSelectedParcel}
                            getOptionLabel={item => `${item.identifier} (${item.category})`}
                            getOptionValue={item => item["@id"].split(':')[3]}
                        />
                        {renderPartOfX()}
                        {renderSensorResultAndObservedProperty()}
                        {renderSelectedCrop()}
                        {renderHasArea()}
                        {renderOperatedOnCompostPile()}
                        {renderAppliedAmount()}
                        {renderApplicationMethod()}
                        {renderPesticide()}
                        {renderNestedActivities()}
                    </Stack>
                </CardContent>
            </Card>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                {onAdd && <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    loading={loading}
                    loadingPosition="start"
                    // disabled={isFormInvalid}
                    onClick={handlePost}
                >
                    Add
                </Button>}
                {onDelete && <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    loading={loading}
                    loadingPosition="start"
                    // disabled={isFormInvalid}
                    onClick={handlePatch}
                >
                    Save Changes
                </Button>}
                {onSave && <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    loading={loading}
                    loadingPosition="start"
                    // disabled={isFormInvalid}
                    onClick={() => {
                        showDialog({
                            title: `Are you sure you want to delete this activity?`,
                            variant: 'yes-no',
                            children: <></>
                        });
                    }}
                >
                    Delete
                </Button>}
            </Box>
            <GenericDialog {...dialogProps} onClose={handleCloseDialog} onYes={handleDelete} />
        </>
    )
}

export default ActivityDynamicCRUDActions;