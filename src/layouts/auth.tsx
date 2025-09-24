import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Footer from "@components/shared/Footer";

const AuthLayout = () => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
        }}>
            <Box component="main" sx={{ flex: '1 0 auto', display: 'flex', justifyContent: 'center', margin: 6 }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
};

export default AuthLayout;