import { Box, Typography, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// import logo from '/logo-white-.png';


const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                py: 2,
                mt: 'auto',
            }}
        >
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', rowGap: 4 }}>

                    {/* <Box sx={{ width: { xs: '100%', md: '50%' }, pr: { md: 5 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <img
                                src={logo}
                                alt="EcoWine Logo"
                                style={{ width: '168px', height: 'auto' }}
                            />
                        </Box>
                    </Box> */}

                    {/* <Box sx={{ width: { xs: '100%', md: '50%' }, pl: { md: 5 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            <Typography variant="body2">
                                                    GreenSupplyChain DIH™ Digital transformation
                                                    services across the agri-food supply chain to
                                                    co-create a sustainable future for all.
                            </Typography>
                        </Box>
                    </Box> */}

                </Box>

                <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="body2">
                        © {new Date().getFullYear()} GreenSupplyChain DIH. All Rights Reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;
