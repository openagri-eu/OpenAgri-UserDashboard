import HomeIcon from '@mui/icons-material/Home';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from 'react-router';
import type { Navigation } from '@toolpad/core';
import { theme } from './theme/theme.tsx';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Home page',
  },
  {
    segment: '',
    title: 'Home page',
    icon: <HomeIcon />,
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