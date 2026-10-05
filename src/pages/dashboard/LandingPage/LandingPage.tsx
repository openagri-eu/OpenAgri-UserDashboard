import ImageButtonGrid from "@components/shared/styled/ImageButtonGrid";
import { useOutletContext } from 'react-router-dom';
import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import { DashboardContextType } from "@layouts/dashboard";
import { useEffect } from "react";
import { Link, Typography } from "@mui/material";

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
            <Typography variant="body1" sx={{ mb: 2 }}>
                Demo username: <strong>OpenAgri_Test</strong> Password: <strong>OpenAgritest00!</strong>
                <br />
                A user manual is available <Link href={USER_MANUAL_URL} target="_blank" rel="noopener">here</Link>.
                <br />
                Please provide your feedback <Link href={FEEDBACK_URL} target="_blank" rel="noopener">here</Link>.
            </Typography>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ImageButtonGrid></ImageButtonGrid>
        </>
    )
}

export default LandingPage;