import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useDialog from "@hooks/useDialog";
import useFetch from "@hooks/useFetch";
import useSnackbar from "@hooks/useSnackbar";
import { FarmCalendarActivityModel } from "@models/FarmCalendarActivity";
import { FarmParcelModel } from "@models/FarmParcel";
import { Box, Button, Card, CardContent, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import GenericDialog from "@components/shared/GenericDialog/GenericDialog";

const EditCalendarActivityPage = () => {
    const [activity, setActivity] = useState<FarmCalendarActivityModel>();
    const [title, setTitle] = useState<string>('');

    const [selectedParcel, setSelectedParcel] = useState<string>('');

    const { id } = useParams();
    const { fetchData, loading, response, error } = useFetch<FarmCalendarActivityModel>(
        `proxy/farmcalendar/api/v1/FarmCalendarActivities/${id}/?format=json`,
        {
            method: 'GET',
        }
    );

    const { fetchData: editFetchData, response: editResponse, error: editError } = useFetch<any>(
        `proxy/farmcalendar/api/v1/FarmCalendarActivities/${id}/?format=json`,
        {
            method: 'PUT',
        }
    );

    const { fetchData: deleteFetchData, error: deleteError } = useFetch<any>(
        `proxy/farmcalendar/api/v1/FarmCalendarActivities/${id}/?format=json`,
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
            showSnackbar('error', 'Error loading activity');
        }
    }, [error])

    useEffect(() => {
        if (editError) {
            showSnackbar('error', 'Error editing activity');
        }
    }, [editError])

    useEffect(() => {
        if (deleteError) {
            showSnackbar('error', 'Error deleting activity');
        }
    }, [deleteError])

    useEffect(() => {
        if (response) {
            setActivity(response);
            setTitle(response.title);
            setSelectedParcel(response.hasAgriParcel["@id"].split(':')[3]);
        }
    }, [response])

    const navigate = useNavigate();
    useEffect(() => {
        if (editResponse) {
            navigate("/farm-calendar");
        }
    }, [editResponse])

    const handleDelete = async () => {
        await deleteFetchData();
        navigate("/farm-calendar");
    };

    const handleEdit = () => {
        editFetchData({
            body: {
                activityType: activity?.activityType["@id"].split(':')[3],
                title: activity?.title,
                details: activity?.details,
                hasStartDatetime: activity?.hasStartDatetime,
                hasEndDatetime: activity?.hasEndDatetime,
                hasAgriParcel: selectedParcel,
                usesAgriculturalMachinery: [] // TODO: change
                // responsibleAgent
            }
        });
    };

    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // const isNumericField = name === 'base_gdd';
        // const finalValue = isNumericField ? parseFloat(value) : value;
        setActivity(prev => prev ? { ...prev, [name]: value } : undefined);
    };

    const handleDateChange = (
        newValue: Dayjs | null,
        fieldName: 'hasStartDatetime' | 'hasEndDatetime'
    ) => {
        const formattedValue = newValue ? newValue.toISOString() : null;
        setActivity(prev => prev ? { ...prev, [fieldName]: formattedValue } : undefined);
    };

    const isFormInvalid =
        !activity?.title?.trim() ||
        !activity.hasStartDatetime ||
        !activity.hasEndDatetime ||
        !selectedParcel

    return (
        <>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !(loading && error) &&
                <Box display={'flex'} flexDirection={'column'} gap={2}>
                    <Typography variant={'h4'} >Edit {title}</Typography>
                    <Card>
                        <CardContent>
                            <Stack direction={'column'} spacing={2} >
                                <TextField fullWidth margin="normal" label="Title" name="title" value={activity?.title ?? ''} onChange={handleChange} error={!activity?.title.trim()} />
                                <DateTimePicker
                                    label="Start datetime"
                                    value={dayjs(activity?.hasStartDatetime)}
                                    onChange={(newValue) => handleDateChange(newValue, 'hasStartDatetime')}
                                />
                                <DateTimePicker
                                    label="End datetime"
                                    value={dayjs(activity?.hasEndDatetime)}
                                    onChange={(newValue) => handleDateChange(newValue, 'hasEndDatetime')}
                                />
                                <TextField fullWidth margin="normal" multiline rows={4} label="Details" name="details" value={activity?.details ?? ''} onChange={handleChange} />
                                <GenericSelect<FarmParcelModel, string>
                                    endpoint='proxy/farmcalendar/api/v1/FarmParcels/?format=json'
                                    label='Has Parcel'
                                    selectedValue={selectedParcel}
                                    setSelectedValue={setSelectedParcel}
                                    getOptionLabel={item => `${item.identifier} (${item.category})`}
                                    getOptionValue={item => item["@id"].split(':')[3]}>
                                </GenericSelect>
                                {/* Hardcoded */}
                                <TextField fullWidth type="number" margin="normal" label="Applied amount" name="appliedAmount" value="2.80"/>
                                <TextField fullWidth margin="normal" label="Applied amount unit" name="appliedAmountUnit" value="L" />
                                <TextField fullWidth margin="normal" label="Pesticide" name="pesticide" value="Ranman Top 160 SC - 160g cyazofamid/L - 0" />
                                {/* Hardcoded */}
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
                                    title: `Are you sure you want to delete this activity?`,
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

export default EditCalendarActivityPage;