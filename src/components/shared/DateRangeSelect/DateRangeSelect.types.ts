import { Dayjs } from "dayjs";

export interface DateRangeSelectProps {
    fromDate: Dayjs | null;
    setFromDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
    toDate: Dayjs | null;
    setToDate: React.Dispatch<React.SetStateAction<Dayjs | null>>;
    maxDate?: Dayjs 
}