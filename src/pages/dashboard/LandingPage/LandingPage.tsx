import ImageButtonGrid from "@components/shared/styled/ImageButtonGrid";
import { useOutletContext } from 'react-router-dom';
import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import { DashboardContextType } from "@layouts/dashboard";
import { useEffect } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Link, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const USER_MANUAL_URL = "/user-manual.pdf";
const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLScltlVkbbhOJ9n8ardZT_TT7LaMH77pGNIBTD_fU5LcjlrD1g/viewform";

const LandingPage = () => {
    const { setPageTitle, setBreadcrumbs } = useOutletContext<DashboardContextType>();

    useEffect(() => {
        setPageTitle('Welcome to the OpenAgri dashboard');
        setBreadcrumbs([]);

        return () => {
            setPageTitle(undefined);
            setBreadcrumbs(undefined);
        };
    }, [setPageTitle, setBreadcrumbs]);

    return (
        <>
            <Box sx={{ marginBottom: 2 }}>
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography component="span">Demo access</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Username: <strong>OpenAgri_Test</strong>
                            <br />
                            Password: <strong>OpenAgritest00!</strong>
                        </Typography>
                        <Typography sx={{ mt: 2 }}>
                            A user manual is available <Link href={USER_MANUAL_URL} target="_blank" rel="noopener">here</Link>.
                        </Typography>
                        <Typography sx={{ mt: 2 }}>
                            Please provide your feedback <Link href={FEEDBACK_URL} target="_blank" rel="noopener">here</Link>.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Box>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ImageButtonGrid></ImageButtonGrid>
        </>
    )
}

export default LandingPage;