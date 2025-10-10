import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useEffect } from 'react';
import { GenericSelectProps } from './GenericSelect.types';
import useFetch from '@hooks/useFetch';

const GenericSelect = <T, R = T[]>({
    endpoint,
    label,
    getOptionLabel,
    getOptionValue,
    selectedValue,
    setSelectedValue,
    transformResponse,
}: GenericSelectProps<T, R>) => {
    const { fetchData, response, loading } = useFetch<R>(endpoint, { method: 'GET' });

    const handleChange = (event: SelectChangeEvent) => {
        setSelectedValue(event.target.value as string);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const items = response && transformResponse ? transformResponse(response) : response || [];

    const isValueValid = Array.isArray(items) && items.some(item => getOptionValue(item) === selectedValue);
    const valueToRender = loading || !isValueValid ? '' : selectedValue;

    return (
        <Box flex={1}>
            <FormControl fullWidth>
                <InputLabel id={`${label}-label`}>{label}</InputLabel>
                <Select
                    labelId={`${label}-label`}
                    value={valueToRender}
                    label={label}
                    disabled={loading}
                    onChange={handleChange}
                >
                    <MenuItem key="empty" value="">
                        <em>Please select an option</em>
                    </MenuItem>
                    {Array.isArray(items) &&
                        items.map((item) => (
                            <MenuItem key={getOptionValue(item)} value={getOptionValue(item)}>
                                {getOptionLabel(item)}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default GenericSelect;