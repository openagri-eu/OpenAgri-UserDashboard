import GenericSnackbar from "@components/shared/GenericSnackbar/GenericSnackbar";
import useSnackbar from "@hooks/useSnackbar";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { alpha, Box, Button, GlobalStyles } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DatesSetArg, EventInput } from '@fullcalendar/core';
import useFetch from "@hooks/useFetch";
import { FarmCalendarActivityModel } from "@models/FarmCalendarActivity";
import { useNavigate } from "react-router-dom";

const calendarPlugins = [dayGridPlugin, timeGridPlugin];
const headerToolbarConfig = {
    left: '',
    center: 'title',
    right: '',
};
const footerToolbarConfig = {
    left: 'prev,next',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
};

const CalendarStyles = () => {
    return (
        <GlobalStyles
            styles={(theme) => ({
                // Border
                '.fc-card-container': {
                    padding: theme.spacing(3),
                    borderRadius: theme.shape.borderRadius,
                    boxShadow: theme.shadows[3],
                    backgroundColor: theme.palette.background.paper,
                    minHeight: 720,
                    flex: 1
                },
                // General styles for the calendar container
                '.fc': {
                    '--fc-border-color': theme.palette.divider,
                    '--fc-today-bg-color': alpha(theme.palette.secondary.main, 0.2),
                    color: theme.palette.text.primary,
                },
                // Styles for all buttons in the header
                '.fc .fc-button': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    border: 'none',
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                },
                // Active / Selected buttons in the toolbar
                '.fc .fc-button-primary:not(:disabled).fc-button-active, .fc .fc-button-primary:not(:disabled):active': {
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                },
                // Events
                '.fc-event': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    borderColor: theme.palette.primary.dark,
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        cursor: 'pointer',
                    }
                },
            })}
        />
    );
};

const FarmCalendar = () => {
    const navigate = useNavigate();

    const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const handleDatesSet = useCallback((dates: DatesSetArg) => {
        setDateRange(prevDateRange => {
            if (prevDateRange.start !== dates.startStr ||
                prevDateRange.end !== dates.endStr) {
                return { start: dates.startStr, end: dates.endStr };
            }
            return prevDateRange;
        });
    }, []);

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
            <CalendarStyles />
            <Box className="fc-card-container">
                <FullCalendar
                    height={'100%'}
                    initialView="dayGridMonth"
                    plugins={calendarPlugins}
                    headerToolbar={headerToolbarConfig}
                    footerToolbar={footerToolbarConfig}
                    datesSet={handleDatesSet}
                    events={calendarEvents}
                    eventClick={(info) => {
                        navigate(`edit-activity/${info.event.id.split(":")[3]}`)
                    }}
                />
            </Box>
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