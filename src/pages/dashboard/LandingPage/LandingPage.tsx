import ImageButtonGrid from "@components/styled/ImageButtonGrid/ImageButtonGrid";
import { useNavigate } from 'react-router-dom';
import { Typography } from "@mui/material";

const LandingPage = () => {
    const navigate = useNavigate();

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
            url: '/weather-data.png', // TODO: change
            title: 'Reporting service',
            f: () => handleNavigate('/reporting-service')
        },
        {
            url: '/weather-data.png',
            title: 'Weather data',
            f: () => handleNavigate('/weather-data')
        },
    ];
    return (
        <>
            <Typography variant="body1">Welcome to the OpenAgri dashboard!</Typography>
            <ImageButtonGrid items={images}></ImageButtonGrid>
        </>
    )
}

export default LandingPage;