import { alpha, Box, Typography, useTheme } from "@mui/material";
import { ParcelSelectionListProps } from "./ParcelSelectionList.types";

import placeholder from '/parcel-placeholder.png';

const ParcelSelectionList: React.FC<ParcelSelectionListProps> = ({ parcels, selectedParcelId, f }) => {
    const theme = useTheme();

    return (
        parcels.map((p) => {
            const isSelected = p["@id"] === selectedParcelId;

            return (
                <Box
                    key={p["@id"]}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 2,
                        boxShadow: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'white',
                        '&:hover': {
                            backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.2) : alpha('rgb(0, 0, 0)', 0.04),
                        }
                    }}
                    onClick={() => f(p)}
                >
                    <Box
                        component="img"
                        src={p.depiction[0] ?? placeholder}
                        alt={`Image of ${p.identifier}`}
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            marginRight: 2,
                        }}
                    />

                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {p.identifier}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {p["@type"]}
                        </Typography>
                    </Box>
                </Box>
            );
        })
    );
};

export default ParcelSelectionList;