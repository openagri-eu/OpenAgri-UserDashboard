import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { StyledFullCalendarProps } from "./StyledFullCalendar.types";
import { alpha, Box, GlobalStyles, CircularProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { DatesSetArg } from "@fullcalendar/core/index.js";

const calendarPlugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];
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
                    flex: 1,
                    position: 'relative',
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
                // Events / TODO: possibly change for dynamic event colors
                '.fc-daygrid-block-event': {
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

const StyledFullCalendar: React.FC<StyledFullCalendarProps> = (
    {
        events,
        eventClick,
        onDateRangeChange,
        eventContent,
        loading = false,
        selectable = false,
        select = undefined
    }
) => {
    const [dateRange, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });

    const handleDatesSet = useCallback((dates: DatesSetArg) => {
        const newStart = dates.startStr;
        const newEnd = dates.endStr;
        if (dateRange.start !== newStart || dateRange.end !== newEnd) {
            setDateRange({ start: newStart, end: newEnd });
            onDateRangeChange({ start: newStart, end: newEnd });
        }
    }, [dateRange, onDateRangeChange]);

    return (
        <>
            <CalendarStyles />
            <Box className="fc-card-container">
                {/* --- START: LOADING OVERLAY --- */}
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            borderRadius: (theme) => theme.shape.borderRadius,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
                {/* --- END: LOADING OVERLAY --- */}

                <FullCalendar
                    height={'100%'}
                    initialView="dayGridMonth"
                    plugins={calendarPlugins}
                    headerToolbar={headerToolbarConfig}
                    footerToolbar={footerToolbarConfig}
                    datesSet={handleDatesSet}
                    events={events}
                    eventClick={loading ? undefined : eventClick}
                    dayMaxEventRows={true}
                    eventContent={eventContent}
                    selectable={selectable}
                    select={select}
                />
            </Box>
        </>
    )
}

export default StyledFullCalendar;