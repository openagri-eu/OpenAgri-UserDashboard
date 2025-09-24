import { alpha, styled, Theme } from '@mui/material/styles';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StyledButton = styled(Button)(({ theme }: { theme: Theme }) => ({
  height: 140,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.common.white,
  borderRadius: 32,
  textTransform: 'none',
  padding: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  width: 180,

  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.dark, 0.9),
  },

  [theme.breakpoints.down('sm')]: {
    width: 'calc(50% - 16px)',
  },
}));

const IconImage = styled('img')({
  width: '104px',
  height: '104px',
  objectFit: 'contain',
});


const ImageButtonGrid: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (to: string) => {
    navigate(to);
  }

  const buttonData = [
    {
      url: '/farm-calendar.png',
      title: 'Farm calendar',
      f: () => handleNavigate('/farm-calendar')
    },
    {
      url: '/irrigation.png',
      title: 'Irrigation',
      f: () => handleNavigate('/eto-calculator')
    },
    {
      url: '/pest-and-disease.png',
      title: 'Pest & disease',
      f: () => handleNavigate('/gdd')
    },
    {
      url: '/weather-data.png',
      title: 'Weather data',
      f: () => handleNavigate('/weather-data')
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: { xs: 2, sm: 3 },
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        width: '100%',
      }}
    >
      {buttonData.map((item) => (
        <StyledButton
          key={item.title}
          onClick={item.f}
          variant="contained"
        >
          <IconImage src={item.url} alt={`${item.title} icon`} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            {item.title}
          </Typography>
        </StyledButton>
      ))}
    </Box>
  );
};

export default ImageButtonGrid;
