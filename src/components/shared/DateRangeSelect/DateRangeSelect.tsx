import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { DateRangeSelectProps } from './DateRangeSelect.types';
import { Box } from '@mui/material';

const DateRangeSelect: React.FC<DateRangeSelectProps> = ({ fromDate, setFromDate, toDate, setToDate, maxDate }) => {

    const handleSetFromDateChange = (newValue: Dayjs | null) => {
        if (newValue?.isAfter(toDate)) {
            setToDate(newValue.add(14, 'days'))
        }
        setFromDate(newValue)
    }

    const handleSetToDateChange = (newValue: Dayjs | null) => {
        if (newValue?.isBefore(fromDate)) {
            setFromDate(newValue.subtract(14, 'days'))
        }
        setToDate(newValue)
    }

    return (
        <Box display={'flex'} gap={2}>
            <Box flex={1}>
                <DatePicker
                    sx={{ width: '100%' }}
                    label="From"
                    value={fromDate}
                    onChange={handleSetFromDateChange}
                />
            </Box>
            <Box flex={1}>
                <DatePicker
                    sx={{ width: '100%' }}
                    label="To"
                    value={toDate}
                    maxDate={maxDate}
                    onChange={handleSetToDateChange}
                />
            </Box>
        </Box>
    )
}

export default DateRangeSelect;