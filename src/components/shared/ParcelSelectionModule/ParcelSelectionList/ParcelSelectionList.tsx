import { Box, Typography } from "@mui/material";
import { ParcelSelectionListProps } from "./ParcelSelectionList.types";

const ParcelSelectionList: React.FC<ParcelSelectionListProps> = ({ parcels, f }) => {

    return (
        parcels.map((p) => {
            return <Box key={p["@id"]} sx={{
                padding: 2,
                boxShadow: 2,
                borderRadius: 2
            }} onClick={() => f(p)}>
                <Typography variant="body1">
                    {p.identifier}
                </Typography>
            </Box>
        })
    )
};

export default ParcelSelectionList