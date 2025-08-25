export interface GenericSelectProps<T, R = T[]> {
    endpoint: string;
    label: string;
    getOptionLabel: (item: T) => string; // Function to get the display label for each item
    getOptionValue: (item: T) => string | number; // Function to get the value for each item
    selectedValue: string | undefined;
    setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
    transformResponse?: (response: R) => T[]; // Function to transform the API response
}