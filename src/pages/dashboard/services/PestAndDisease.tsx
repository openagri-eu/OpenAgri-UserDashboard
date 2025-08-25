import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import DateRangeSelect from "@components/shared/DateRangeSelect/DateRangeSelect";
import GenericSelect from "@components/shared/GenericSelect/GenericSelect";
import StyledFullCalendar from "@components/shared/styled/StyledFullCalendar/StyledFullCalendar";
import { useSession } from "@contexts/SessionContext";
import { EventContentArg, EventInput } from "@fullcalendar/core/index.js";
import useFetch from "@hooks/useFetch";
import { DiseaseModel, DiseasesResponseModel } from "@models/Disease";
import { GDDModel } from "@models/GDD.jsonld";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";

const PestAndDiseasePage = () => {

    const { session } = useSession()

    const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs().subtract(14, 'days'));
    const [toDate, setToDate] = useState<Dayjs | null>(dayjs());
    const [selectedDisease, setSelectedDisease] = useState<string>('');

    const [_, setDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });


    const { fetchData, response, error } = useFetch<GDDModel>( // TODO: handle loading
        `proxy/pdm/api/v1/model/${selectedDisease}/gdd/?parcel_id=${session?.farm_parcel?.["@id"].split(":")[3]}&from_date=${fromDate?.format('YYYY-MM-DD')}&to_date=${toDate?.format('YYYY-MM-DD')}`,
        {
            method: 'GET',
        }
    );

    const handleDisplayGDD = () => {
        fetchData();
    };

    const calendarEvents = useMemo(() => {
        if (!Array.isArray(response?.["@graph"])) {
            return [];
        }
        return response["@graph"][0][0].hasMember.map((event): EventInput => ({
            id: event['@id'],
            title: event.descriptor,
            start: event.phenomenonTime,
            display: 'list-item',
            extendedProps: {
                details: event.descriptor,
            }
        }));
    }, [response]);

    const renderEventContent = (eventInfo: EventContentArg) => {
        const { event, timeText } = eventInfo;
        const description = event.extendedProps.description;

        return (
            <Tooltip
                title={
                    <>
                        <Typography color="inherit" variant="subtitle1" component="div">
                            <b>{event.title}</b>
                        </Typography>
                        {description && <Typography variant="body2">{description}</Typography>}
                    </>
                }
                placement="top"
                arrow
            >
                {/* This is the inner content that is actually rendered on the calendar.
              We let FullCalendar handle the main event block.
            */}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <em>{timeText}</em>
                    <span> {event.title}</span>
                </div>
            </Tooltip>
        );
    };

    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <Box display={'flex'} flexDirection={'column'} gap={2}>
                <GenericSelect<DiseaseModel, DiseasesResponseModel>
                    endpoint='proxy/pdm/api/v1/disease/'
                    label='Diseases'
                    transformResponse={response => response.diseases}
                    selectedValue={selectedDisease}
                    setSelectedValue={setSelectedDisease}
                    getOptionLabel={item => item.name}
                    getOptionValue={item => item.id}>
                </GenericSelect>
                <DateRangeSelect
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}>
                </DateRangeSelect>
                <Box><Button
                    onClick={() => handleDisplayGDD()}
                    variant="contained"
                    disabled={!session?.farm_parcel || !selectedDisease || !fromDate || !toDate}
                >
                    Display GDD
                </Button></Box>
                {calendarEvents && !error &&
                    <StyledFullCalendar
                        events={calendarEvents}
                        onDateRangeChange={setDateRange}
                        eventContent={renderEventContent}
                    />
                }
            </Box>
        </>
    )
}

export default PestAndDiseasePage;