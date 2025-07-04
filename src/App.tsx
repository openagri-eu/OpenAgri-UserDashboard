import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from 'react-router';
import type { Navigation } from '@toolpad/core';
import { theme } from '@theme/theme';

import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PestControlIcon from '@mui/icons-material/PestControl';
import AssessmentIcon from '@mui/icons-material/Assessment'; // TODO: possibly change to something else
import ThermostatIcon from '@mui/icons-material/Thermostat';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Home page',
  },
  {
    segment: '',
    title: 'OpenAgri Dashboard',
    icon: <HomeIcon />,
  },
  {
    kind: 'header',
    title: 'Services',
  },
  {
    segment: 'farm-calendar',
    title: 'Farm calendar',
    icon: <CalendarMonthIcon />,
  },
  {
    segment: 'irrigation',
    title: 'Irrigation management',
    icon: <WaterDropIcon />,
  },
  {
    segment: 'pest-and-disease',
    title: 'Pest and disease management',
    icon: <PestControlIcon />,
  },
  {
    segment: 'reporting-service',
    title: 'Reporting service',
    icon: <AssessmentIcon />,
  },
  {
    segment: 'weather-data',
    title: 'Weather data',
    icon: <ThermostatIcon />,
  },
];

const BRANDING = {
  logo: <img className='' src="/logo-color.png" alt="" />,
  title: ''
};

export default function App() {
  return (
    <ReactRouterAppProvider theme={theme} navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}