import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <Box padding={4} height={"100vh"} display={"flex"} alignItems={"center"}>
            <Box >
                <div></div>
            </Box>
            <Box flex={1}>
                <Outlet />
            </Box>
            <Box>
                <div></div>
            </Box>
        </Box>
    );
};

export default AuthLayout;