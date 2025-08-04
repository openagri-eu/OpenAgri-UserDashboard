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
import { useEffect, useState } from 'react';
import SessionContext, { Session } from '@contexts/SessionContext';

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
    children: [
      {
        segment: 'farm-calendar',
        title: 'Farm calendar',
        icon: <CalendarMonthIcon />,
      },
      {
        segment: 'reporting-service',
        title: 'Reporting service',
        icon: <AssessmentIcon />,
      },
    ]
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
  const [session, setSession] = useState<Session | null>(() => {
    const storedSession = localStorage.getItem("session");
    return storedSession ? JSON.parse(storedSession) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session));
    } else {
      localStorage.removeItem('session');
    }
  }, [session]);

  return (
    <ReactRouterAppProvider theme={theme} navigation={NAVIGATION} branding={BRANDING}>
      <SessionContext.Provider value={{ session, setSession }}>
        <Outlet />
      </SessionContext.Provider>
    </ReactRouterAppProvider>
  );
}