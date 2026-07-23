import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from 'react-router';
import type { Navigation } from '@toolpad/core';
import { theme } from '@theme/theme';

import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import WaterDropIcon from '@mui/icons-material/WaterDrop';
// import PestControlIcon from '@mui/icons-material/PestControl';
// import AssessmentIcon from '@mui/icons-material/Assessment'; // TODO: possibly change to something else
// import ThermostatIcon from '@mui/icons-material/Thermostat';
import { useEffect, useState, useMemo } from 'react';
import SessionContext, { Session } from '@contexts/SessionContext';
import { Folder } from '@mui/icons-material';
import FenceIcon from '@mui/icons-material/Fence';
import MapIcon from '@mui/icons-material/Map';
import WineBarIcon from '@mui/icons-material/WineBar';
// import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
// import TimelineIcon from '@mui/icons-material/Timeline';
// import NoteAddIcon from '@mui/icons-material/NoteAdd';
// import AnalyticsIcon from '@mui/icons-material/Analytics';
import CompostIcon from '@mui/icons-material/Compost';
// import CrueltyFreeIcon from '@mui/icons-material/CrueltyFree';
// import ReportIcon from '@mui/icons-material/Report';
// import CoronavirusIcon from '@mui/icons-material/Coronavirus';
// import GrassIcon from '@mui/icons-material/Grass';

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

  const navigation = useMemo(() => {
    // const hasAccess = (code: string) => {
    //   if (!session || !session.services) return false;
    //   const service = session.services.find(s => s.code === code);
    //   return service ? service.actions.includes('view') : false;
    // };

    // const hasAccessIrriUploadDataset = () => {
    //   if (!session || !session.services) return false;
    //   const service = session.services.find(s => s.code === 'IRM');
    //   return service ? service.actions.includes('add') : false;
    // }

    const nav: any[] = [
      {
        kind: 'header',
        title: 'Home page',
      },
      {
        segment: '',
        title: 'EcoWine Dashboard',
        icon: <HomeIcon />,
      },
      {
        kind: 'header',
        title: 'Calendar',
      },
      {
        segment: 'calendar',
        title: 'Calendar',
        icon: <CalendarMonthIcon />,
        disabled: false,
      },
      {
        segment: 'assets',
        title: 'Assets',
        icon: <Folder />,
        disabled: false,
        children: [
          {
            segment: 'farms',
            title: 'Farms',
            icon: <FenceIcon />,
            disabled: false,
          },
          {
            segment: 'parcels',
            title: 'Parcels',
            icon: <MapIcon />,
            disabled: false,
          },
          {
            segment: 'wineries',
            title: 'Wineries',
            icon: <WineBarIcon />,
            disabled: false,
          }
        ]
      },
      {
        kind: 'header',
        title: 'GHG emissions',
      },
      {
        segment: 'ghg-emissions',
        title: 'GHG emissions',
        icon: <CompostIcon />,
        disabled: false,
      },
    ];

    return nav as Navigation;
  }, [session]);

  return (
    <ReactRouterAppProvider theme={theme} navigation={navigation} branding={BRANDING}>
      <SessionContext.Provider value={{ session, setSession }}>
        <Outlet />
      </SessionContext.Provider>
    </ReactRouterAppProvider>
  );
}