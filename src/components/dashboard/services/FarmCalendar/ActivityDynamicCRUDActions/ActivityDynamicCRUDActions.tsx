import { AddRawMaterialOperationModel, BaseActivityModel } from "@models/FarmCalendarActivities";
import { ActivityDynamicCRUDActionsProps } from "./ActivityDynamicCRUDActions.types";
import { Box, Button, Card, CardContent, IconButton, List, ListItem, ListItemButton, ListItemText, Stack, TextField, Typography } from "@mui/material";
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
import { FertilizerModel } from "@models/Fertilizer";

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { FarmCalendarActivityModel } from "@models/FarmCalendarActivity";
import useFetch from "@hooks/useFetch";
import { useNavigate } from "react-router-dom";

const ActivityDynamicCRUDActions = <T extends BaseActivityModel>({ activity, activityTypes, onAdd, onDelete, onSave, loading }: ActivityDynamicCRUDActionsProps<T>) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<T>(activity);
    const [selectedParcel, setSelectedParcel] = useState<string>('');
    const [selectedAgriCrop, setSelectedAgriCrop] = useState<string>('');
    const [selectedAgriMachines, setSelectedAgriMachines] = useState<string[]>([]);
    const [operatedOnCompostPile, setOperatedOnCompostPile] = useState<string>('');
    const [selectedPesticide, setSelectedPesticide] = useState<string>('');
    const [selectedFertilizer, setSelectedFertilizer] = useState<string>('');
    const [parentActivity, setParentActivity] = useState<string>('');

    /** All calendar activities section start */
    const [allActivities, setAllActivities] = useState<FarmCalendarActivityModel[]>([]);

    const { fetchData: fetchDataAllActivities, response: responseAllActivities } = useFetch<FarmCalendarActivityModel[]>(
        `proxy/farmcalendar/api/v1/FarmCalendarActivities/?format=json`,
        {
            method: 'GET',
        }
    );

    useEffect(() => {
        if (responseAllActivities) {
            setAllActivities(responseAllActivities);
        }
    }, [responseAllActivities])
    /** All calendar activities section end */

    useEffect(() => {
        fetchDataAllActivities();

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

        let parentActivityID: string | undefined;
        if ('isPartOfActivity' in formData) {
            if (formData.isPartOfActivity)
                parentActivityID = (formData as any).isPartOfActivity["@id"];
        } else if ('relatedObservation' in formData) {
            if (formData.relatedObservation)
                parentActivityID = (formData as any).relatedObservation["@id"];
        }
        if (parentActivityID) {
            const idParts = parentActivityID.split(':');
            setParentActivity(idParts[idParts.length - 1]);
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

        let fertilizerID: string | undefined;
        if ('usesFertilizer' in formData) {
            fertilizerID = (formData as any).usesFertilizer["@id"];
        }
        if (fertilizerID) {
            const idParts = fertilizerID.split(':');
            setSelectedFertilizer(idParts[idParts.length - 1]);
        }
    }, []);

    const { dialogProps, showDialog } = useDialog();

    const handleCloseDialog = () => {
        dialogProps.onClose();
    };

    /** -------------------------------------------------------------------------- */

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

    const handleAddCompostMaterial = () => {
        setFormData(prev => {
            if (!prev || !('hasCompostMaterial' in prev)) return prev;

            const newState = JSON.parse(JSON.stringify(prev)) as T & AddRawMaterialOperationModel;
            const newMaterial = {
                "@id": Date.now().toString(),
                "@type": '',
                typeName: '',
                quantityValue: {
                    "@id": '',
                    "@type": '',
                    unit: '',
                    numericValue: 0
                }
            };
            newState.hasCompostMaterial.push(newMaterial);

            return newState;
        });
    };

    const handleRemoveCompostMaterial = (itemId: string) => () => {
        setFormData(prev => {
            if (!prev || !('hasCompostMaterial' in prev)) return prev;

            const newState = JSON.parse(JSON.stringify(prev)) as T & AddRawMaterialOperationModel;
            newState.hasCompostMaterial = newState.hasCompostMaterial.filter(mat => mat['@id'] !== itemId);

            return newState;
        });
    };

    const handleCompostMaterialChange = (itemId: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

            const { name, value } = e.target;
            const keys = name.split('.');

            setFormData(prev => {
                if (!prev || !('hasCompostMaterial' in prev)) return prev;

                const newState = JSON.parse(JSON.stringify(prev)) as T & AddRawMaterialOperationModel;

                const materialToUpdate = newState.hasCompostMaterial.find(mat => mat['@id'] === itemId);
                if (!materialToUpdate) return prev;

                let currentLevel: any = materialToUpdate;
                try {
                    for (let i = 0; i < keys.length - 1; i++) {
                        currentLevel = currentLevel[keys[i]];
                    }

                    const finalKey = keys[keys.length - 1];

                    const isNumeric = typeof currentLevel[finalKey] === 'number';
                    currentLevel[finalKey] = isNumeric ? parseFloat(value) || 0 : value;

                } catch (error) {
                    console.error(`Error setting nested property "${name}" on item ${itemId}:`, error);
                    return prev;
                }

                return newState;
            });
        };
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
                {'hasResult' in formData && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            fullWidth margin="normal" label="Value"
                            name="hasResult.hasValue"
                            value={(formData.hasResult as ResultShape).hasValue ?? ''}
                            onChange={handleChange}
                            error={!(formData.hasResult as ResultShape).hasValue?.trim()} />
                        <TextField
                            fullWidth margin="normal" label="Value unit"
                            name="hasResult.unit"
                            value={(formData.hasResult as ResultShape).unit ?? ''}
                            onChange={handleChange}
                            error={!(formData.hasResult as ResultShape).unit?.trim()} />
                    </Stack>
                )}
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

    const renderSeverity = () => {
        return (
            <>
                {'severity' in formData && (
                    <div>severity WIP</div>
                )}
            </>
        )
    }

    const renderUsesIrrigationSystem = () => {
        return (
            <>
                {'usesIrrigationSystem' in formData && (
                    <div>irrigation system WIP</div>
                )}
            </>
        )
    }

    const renderSelectedCrop = () => {
        // NTH: filter if parcel is selected
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
                {'hasAppliedAmount' in formData && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            fullWidth label="Applied amount"
                            name="hasAppliedAmount.numericValue"
                            type="number"
                            value={isNaN((formData.hasAppliedAmount as AppliedAmountShape)['numericValue']) ?
                                '' : (formData.hasAppliedAmount as AppliedAmountShape)["numericValue"]}
                            onChange={handleChange}
                            error={isNaN((formData.hasAppliedAmount as AppliedAmountShape)['numericValue'])} />
                        <TextField
                            fullWidth margin="normal" label="Applied amount unit"
                            name="hasAppliedAmount.unit"
                            value={(formData.hasAppliedAmount as AppliedAmountShape).unit ?? ''}
                            onChange={handleChange}
                            error={!(formData.hasAppliedAmount as AppliedAmountShape).unit?.trim()} />
                    </Stack>
                )}
            </>
        )
    }

    const renderPesticide = () => {
        // NTH: filter if parcel is selected
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

    const renderFertilizer = () => {
        // NTH: filter if parcel is selected
        return (
            <>
                {'usesFertilizer' in formData && (
                    <GenericSelect<FertilizerModel>
                        endpoint='proxy/farmcalendar/api/v1/Fertilizers/?format=json'
                        label='Fertilizer'
                        selectedValue={selectedFertilizer}
                        setSelectedValue={setSelectedFertilizer}
                        getOptionLabel={item => `${item.hasCommercialName} - ${item.hasActiveSubstance} - ${item.hasNutrientConcentration}`}
                        getOptionValue={item => item["@id"].split(':')[3]}
                    />
                )}
            </>
        )
    }

    const renderCompostMaterials = () => {
        return (
            <>
                {'hasCompostMaterial' in formData && (
                    <Box display={'flex'} flexDirection={'column'} gap={2}>
                        <Typography variant="h6">Compost materials</Typography>
                        {(formData.hasCompostMaterial as AddRawMaterialOperationModel['hasCompostMaterial']).map((compMat) => {
                            return (
                                <Card key={`compMat-${compMat["@id"]}`} /*sx={{ backgroundColor: theme.palette.background.default }}*/>
                                    <CardContent>
                                        <Stack display={'flex'} direction={{ sm: 'column', md: 'row' }} gap={2}>
                                            <Box display={'flex'} gap={2} minWidth={"60%"}>
                                                <TextField fullWidth label="Material name"
                                                    name="typeName"
                                                    value={compMat.typeName ?? ''}
                                                    onChange={handleCompostMaterialChange(compMat["@id"])}
                                                    error={!compMat.typeName?.trim()} />
                                                <TextField fullWidth label="Quantity"
                                                    name="quantityValue.numericValue"
                                                    type="number"
                                                    value={isNaN(compMat.quantityValue.numericValue) ? '' : compMat.quantityValue.numericValue}
                                                    onChange={handleCompostMaterialChange(compMat["@id"])}
                                                    error={isNaN(compMat.quantityValue.numericValue)} />
                                            </Box>
                                            <Box display={'flex'} gap={2} flex={1} minWidth={200}>
                                                <TextField fullWidth label="Unit"
                                                    name="quantityValue.unit"
                                                    value={compMat.quantityValue.unit ?? ''}
                                                    onChange={handleCompostMaterialChange(compMat["@id"])}
                                                    error={!compMat.quantityValue.unit?.trim()} />
                                                <IconButton aria-label="remove"
                                                    onClick={handleRemoveCompostMaterial(compMat["@id"])}>
                                                    <RemoveCircleOutlineIcon />
                                                </IconButton>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddCompostMaterial}
                            >
                                Add compost material
                            </Button>
                        </Box>
                    </Box>
                )}
            </>
        )
    }

    const renderNestedActivities = () => {
        let nestedActivities = [];
        if ('hasMeasurement' in formData) {
            nestedActivities.push(...(formData.hasMeasurement as any));
        }
        if ('hasNestedOperation' in formData) {
            nestedActivities.push(...(formData.hasNestedOperation as any));
        }
        if (nestedActivities.length && allActivities.length) {
            const allActivitiesWithEndpoints = allActivities.map(a => {
                return {
                    ...a,
                    activity_endpoint: activityTypes.find(at => at["@id"].split(':')[3] === a.activityType["@id"].split(':')[3])?.activity_endpoint
                }
            })

            nestedActivities = nestedActivities.map(na => {
                const naID = na["@id"].split(':')[3];
                const additionalParams = allActivitiesWithEndpoints.find(a => a["@id"].split(':')[3] === naID);

                return {
                    ...na,
                    title: additionalParams?.title,
                    hasStartDatetime: additionalParams?.hasStartDatetime,
                    hasEndDatetime: additionalParams?.hasEndDatetime,
                    activity_endpoint: additionalParams?.activity_endpoint
                }
            })
        }
        return (
            <>
                {nestedActivities.length > 0 &&
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Nested activities</Typography>
                            <List dense={nestedActivities.length > 10}>
                                {nestedActivities.map((n: any) => {
                                    return <ListItem key={`nested-activity-${n["@id"]}`} disablePadding>
                                        <ListItemButton onClick={() => {
                                            navigate(`/farm-calendar/edit-activity/${n["@id"].split(":")[3]}`, { state: { api: n.activity_endpoint, activityTypes: activityTypes } })

                                        }}>
                                            <ListItemText
                                                primary={`${n.title} (${dayjs(n.hasStartDatetime).format('YYYY-MM-DD HH:mm')} - ${dayjs(n.hasEndDatetime).format('YYYY-MM-DD HH:mm')})`}
                                            />
                                        </ListItemButton>
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
        if ('isPartOfActivity' in body) {
            if (!body.isPartOfActivity) {
                body.isPartOfActivity = { '@id': '', '@type': 'FarmCalendarActivity' }
            }
            if (parentActivity) {
                (body.isPartOfActivity as { '@id': string })['@id'] = `urn:farmcalendar:FarmCalendarActivity:${parentActivity}`;
            } else {
                body.isPartOfActivity = null;
            }
        } else if ('relatedObservation' in body) {
            if (!body.relatedObservation) {
                body.relatedObservation = { '@id': '', '@type': 'Observation' }
            }
            if (parentActivity) {
                (body.relatedObservation as { '@id': string })['@id'] = `urn:farmcalendar:Observation:${parentActivity}`;
            } else {
                body.relatedObservation = null;
            }
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
        if ('usesFertilizer' in body) {
            (body.usesFertilizer as { '@id': string })['@id'] = `urn:farmcalendar:Fertilizer:${selectedFertilizer}`;
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
                        {/* NTH: string filtering of the displayed activities */}
                        <GenericSelect<FarmCalendarActivityModel>
                            endpoint=''
                            data={allActivities}
                            label='Part of activity'
                            // Filtering out the current activity to avoid recursive links
                            transformResponse={resp => {
                                return resp.filter(fa => {
                                    return fa["@id"].split(':')[3] !== formData["@id"].split(':')[3]
                                })
                            }}
                            selectedValue={parentActivity}
                            setSelectedValue={setParentActivity}
                            getOptionLabel={
                                item => `${item.title} (${dayjs(item.hasStartDatetime).format('YYYY-MM-DD HH:mm')} - ${dayjs(item.hasEndDatetime).format('YYYY-MM-DD HH:mm')})`
                            }
                            getOptionValue={item => item["@id"].split(':')[3]}
                        />
                        {renderSeverity()}
                        {renderSensorResultAndObservedProperty()}
                        {renderSelectedCrop()}
                        {renderHasArea()}
                        {renderOperatedOnCompostPile()}
                        {renderAppliedAmount()}
                        {renderUsesIrrigationSystem()}
                        {renderApplicationMethod()}
                        {renderPesticide()}
                        {renderFertilizer()}
                        {renderCompostMaterials()}
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