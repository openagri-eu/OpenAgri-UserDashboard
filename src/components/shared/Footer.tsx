import { Box, Typography, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import logo from '/logo-white.png';
import flag from '/eu-flag-white.png';


const Footer = () => {
    const theme = useTheme();

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                py: { xs: 2, sm: 3 },
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', rowGap: 4 }}>

                    <Box sx={{ width: { xs: '100%', md: '50%' }, pr: { md: 2 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <img
                                src={logo}
                                alt="OpenAgri Logo"
                                style={{ width: '200px', height: 'auto' }}
                            />
                            <Typography variant="h6" component="p" sx={{ fontWeight: 'bold' }}>
                                OpenAgri — Where Inclusive Innovation Meets Agriculture!
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: '50%' }, pl: { md: 2 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            <img
                                src={flag}
                                alt="European Union Flag"
                                style={{ width: '200px', height: 'auto', flexShrink: 0 }}
                            />
                            <Typography variant="body2">
                                OpenAgri has received funding from the EU’s Horizon Europe research and innovation
                                programme under Grant Agreement no. 101134083. This output reflects only the
                                author’s view and the European Commission cannot be held responsible for any use
                                that may be made of the information contained therein.
                            </Typography>
                        </Box>
                    </Box>

                </Box>

                <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="body2">
                        © {new Date().getFullYear()} OpenAgri Project. All Rights Reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;