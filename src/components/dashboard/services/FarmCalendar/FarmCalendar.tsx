import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useSnackbar from "@hooks/useSnackbar";
import { Box, Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { EventInput } from '@fullcalendar/core';
import useFetch from "@hooks/useFetch";
import { FarmCalendarActivityModel } from "@models/FarmCalendarActivity";
import { useNavigate } from "react-router-dom";
import StyledFullCalendar from "@components/shared/styled/StyledFullCalendar/StyledFullCalendar";

const FarmCalendar = () => {
    const navigate = useNavigate();

    const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const { fetchData, response, error } = useFetch<FarmCalendarActivityModel[]>(
        `proxy/farmcalendar/api/v1/FarmCalendarActivities/?format=json&start=${dateRange.start}&end=${dateRange.end}`,
        {
            method: 'GET',
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            fetchData();
        }
    }, [dateRange])

    useEffect(() => {
        if (error) {
            showSnackbar('error', 'Error loading activities');
        }
    }, [error])

    const calendarEvents = useMemo(() => {
        if (!Array.isArray(response)) {
            return [];
        }
        return response.map((event): EventInput => ({
            id: event['@id'],
            title: event.title,
            start: event.hasStartDatetime,
            end: event.hasEndDatetime,
            extendedProps: {
                details: event.details,
                activityType: event.activityType,
            }
        }));
    }, [response]);

    return (
        <>
            <Box sx={{ marginBottom: 2 }}>
                <Button onClick={() => navigate('register-activity')} variant="contained">Register new calendar activity</Button>
            </Box>
            <StyledFullCalendar
                events={calendarEvents}
                eventClick={
                    (info) => {
                        navigate(`edit-activity/${info.event.id.split(":")[3]}`)
                    }
                }
                onDateRangeChange={setDateRange}
            />
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </>
    )
}

export default FarmCalendar;