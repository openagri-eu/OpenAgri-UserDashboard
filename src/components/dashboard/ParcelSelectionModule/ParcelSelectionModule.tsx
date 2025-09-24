import useFetch from "@hooks/useFetch";
import { useEffect, useState } from "react";
import GenericSnackbar from "../../shared/GenericSnackbar/GenericSnackbar";
import useSnackbar from "@hooks/useSnackbar";
import { FarmParcelModel } from "@models/FarmParcel";
import { useSession } from "@contexts/SessionContext";
import { Box, Button, Skeleton } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ParcelSelectionList from "./ParcelSelectionList/ParcelSelectionList";
import DeleteIcon from '@mui/icons-material/Delete';

const ParcelSelectionModule = () => {

    const [parcels, setParcels] = useState<FarmParcelModel[]>([]);
    const { session, setSession } = useSession();
    const [expanded, setExpanded] = useState<boolean>(!session?.farm_parcel);

    const { fetchData, loading, response, error } = useFetch<FarmParcelModel[]>(
        "proxy/farmcalendar/api/v1/FarmParcels/?format=json",
        {
            method: 'GET',
        }
    );

    const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (error) {
            showSnackbar('error', 'Error loading parcel list');
        }
    }, [error])

    useEffect(() => {
        if (response) {
            setParcels(response)
        }
    }, [response])

    const selectFarmParcel = (parcel?: FarmParcelModel) => {
        setExpanded(!parcel);
        setSession(prevSession => {
            if (prevSession) {
                return {
                    ...prevSession,
                    farm_parcel: parcel,
                };
            }
            return null;
        });
    };

    const handleAccordionChange = () => {
        setExpanded(!expanded);
    };

    return (
        <Box sx={{ marginBottom: 2 }}>
            {loading && <Skeleton variant="rectangular" height={48} />}
            {
                !loading && !error &&
                <Accordion defaultExpanded={!session?.farm_parcel} expanded={expanded} onChange={handleAccordionChange}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        {
                            session?.farm_parcel &&
                            <Typography component="span">
                                Selected parcel: {session.farm_parcel.identifier}
                            </Typography>
                        }
                        {
                            !session?.farm_parcel &&
                            <Typography component="span">
                                No parcel selected
                            </Typography>
                        }
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <ParcelSelectionList parcels={parcels} selectedParcelId={session?.farm_parcel?.["@id"]} f={selectFarmParcel}></ParcelSelectionList>
                            <Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => selectFarmParcel(undefined)}
                                >
                                    Remove selected parcel
                                </Button>
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            }
            <GenericSnackbar
                type={snackbarState.type}
                message={snackbarState.message}
                open={snackbarState.open}
                onClose={closeSnackbar}
            />
        </Box>
    )
};

export default ParcelSelectionModule;