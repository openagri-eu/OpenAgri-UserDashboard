import ImageButtonGrid from "@components/shared/styled/ImageButtonGrid";
import { useOutletContext } from 'react-router-dom';
import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import { DashboardContextType } from "@layouts/dashboard";
import { useEffect } from "react";

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
            <ParcelSelectionModule></ParcelSelectionModule>
            <ImageButtonGrid></ImageButtonGrid>
        </>
    )
}

export default LandingPage;