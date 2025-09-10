import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from 'react-router';
import type { Navigation } from '@toolpad/core';
import { theme } from '@theme/theme';

import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PestControlIcon from '@mui/icons-material/PestControl';
import AssessmentIcon from '@mui/icons-material/Assessment'; // TODO: possibly change to something else
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { useEffect, useState } from 'react';
import SessionContext, { Session } from '@contexts/SessionContext';
import { Folder } from '@mui/icons-material';
import FenceIcon from '@mui/icons-material/Fence';
import MapIcon from '@mui/icons-material/Map';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import TimelineIcon from '@mui/icons-material/Timeline';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AnalyticsIcon from '@mui/icons-material/Analytics';


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
    title: 'Farm calendar',
  },
  // {
  //   segment: 'farm-calendar',
  //   title: 'Farm calendar',
  //   icon: <CalendarMonthIcon />,
  //   children: [
  {
    segment: 'farm-calendar',
    title: 'Farm calendar',
    icon: <CalendarMonthIcon />,
  },
  {
    segment: 'farm-locations',
    title: 'Farm locations',
    icon: <Folder />,
    children: [
      {
        segment: 'farms',
        title: 'Farms',
        icon: <FenceIcon />,
      },
      {
        segment: 'farm-parcels',
        title: 'Farm parcels',
        icon: <MapIcon />,
      }
    ]
  },
  {
    segment: 'reporting-service',
    title: 'Reporting service',
    icon: <AssessmentIcon />,
  },
  //   ]
  // },
  {
    kind: 'header',
    title: 'Irrigation management',
  },
  {
    segment: 'wkt-input',
    title: 'WKT input',
    icon: <AddLocationAltIcon />,
  },
  {
    segment: 'eto-calculator',
    title: 'ETo Calculator',
    icon: <TimelineIcon />,
  },
  { kind: 'divider' },
  {
    segment: 'upload-dataset',
    title: 'Upload Dataset',
    icon: <NoteAddIcon />,
  },
  {
    segment: 'soil-moisture-analysis',
    title: 'Soil Moisture Analysis',
    icon: <AnalyticsIcon />,
  },
  {
    kind: 'header',
    title: 'Pest and disease management',
  },
  {
    segment: 'pest-and-disease',
    title: 'Pest and disease management',
    icon: <PestControlIcon />,
  },
  {
    kind: 'header',
    title: 'Weather data',
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