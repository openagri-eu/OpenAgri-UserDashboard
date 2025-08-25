import { CustomContentGenerator, EventClickArg, EventContentArg, EventSourceInput } from "@fullcalendar/core/index.js";

export interface StyledFullCalendarProps {
    events: EventSourceInput | undefined;
    eventClick?: ((arg: EventClickArg) => void);
    onDateRangeChange: (dateRange: { start: string; end: string }) => void;
    eventContent?: CustomContentGenerator<EventContentArg>

}