import ImageButtonGrid from "@components/shared/styled/ImageButtonGrid/ImageButtonGrid";
import { useNavigate, useOutletContext } from 'react-router-dom';
import ParcelSelectionModule from "@components/dashboard/ParcelSelectionModule/ParcelSelectionModule";
import { DashboardContextType } from "@layouts/dashboard";
import { useEffect } from "react";

const LandingPage = () => {
    const navigate = useNavigate();

    const { setPageTitle, setBreadcrumbs } = useOutletContext<DashboardContextType>();

    useEffect(() => {
        setPageTitle('Welcome to the OpenAgri dashboard');
        setBreadcrumbs([]);

        return () => {
            setPageTitle(undefined);
            setBreadcrumbs(undefined);
        };
    }, [setPageTitle, setBreadcrumbs]);

    const handleNavigate = (to: string) => {
        navigate(to);
    }

    const images = [
        {
            url: '/farm-calendar.png',
            title: 'Farm calendar',
            f: () => handleNavigate('/farm-calendar')
        },
        {
            url: '/irrigation.png',
            title: 'Irrigation management',
            f: () => handleNavigate('/irrigation')
        },
        {
            url: '/pest-and-disease.png',
            title: 'Pest and disease management',
            f: () => handleNavigate('/pest-and-disease')
        },
        {
            url: '/weather-data.png',
            title: 'Weather data',
            f: () => handleNavigate('/weather-data')
        },
    ];
    return (
        <>
            <ParcelSelectionModule></ParcelSelectionModule>
            <ImageButtonGrid items={images}></ImageButtonGrid>
        </>
    )
}

export default LandingPage;