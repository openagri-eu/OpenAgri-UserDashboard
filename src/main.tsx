import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router';

import Redirect from '@components/shared/Redirect/Redirect.tsx';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import DashLayout from './layouts/dashboard.tsx';
import LandingPage from '@pages/dashboard/LandingPage/LandingPage.tsx';
import FarmCalendarPage from '@pages/dashboard/services/FarmCalendar/FarmCalendar.tsx';
import IrrigationPage from '@pages/dashboard/services/Irrigation.tsx';
import PestAndDiseasePage from '@pages/dashboard/services/PestAndDisease.tsx';
import ReportingServicePage from '@pages/dashboard/services/FarmCalendar/ReportingService.tsx';
import AuthLayout from '@layouts/auth.tsx';
import SignInPage from '@pages/auth/SignIn/SignInPage.tsx';
import SignUpPage from '@pages/auth/SignUp/SignUpPage.tsx';
import FarmParcelPage from '@pages/dashboard/services/FarmCalendar/FarmLocations/FarmParcel.tsx';
import FarmParcelsPage from '@pages/dashboard/services/FarmCalendar/FarmLocations/FarmParcels.tsx';
import FarmsPage from '@pages/dashboard/services/FarmCalendar/FarmLocations/Farms.tsx';
import FarmPage from '@pages/dashboard/services/FarmCalendar/FarmLocations/Farm.tsx';
import TokenRefreshPage from '@pages/auth/TokenRefresh/TokenRefresh.tsx';
import RegisterCalendarActivityPage from '@pages/dashboard/services/FarmCalendar/FarmCalendarActivities/RegisterActivity.tsx';
import EditCalendarActivityPage from '@pages/dashboard/services/FarmCalendar/FarmCalendarActivities/EditActivity.tsx';
import WeatherDataPage from '@pages/dashboard/services/WeatherData/WeatherData.tsx';

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: DashLayout,
        children: [
          {
            path: '',
            Component: LandingPage
          },
          /** Farm calendar */
          {
            path: 'farm-calendar',
            // children: [
            //   {
            //     index: true,
            //     element: <Redirect to='farm-calendar/farm-calendar' />,
            //   },
            //   /** Farm calendar */
            //   {
            //     path: 'farm-calendar',
            Component: FarmCalendarPage,
          },
          {
            path: 'farm-calendar/register-activity',
            Component: RegisterCalendarActivityPage
          },
          {
            path: 'farm-calendar/edit-activity/:id',
            Component: EditCalendarActivityPage
          },
          {
            path: 'farm-locations',
            children: [
              {
                index: true,
                element: <Redirect to='farm-calendar/farm-calendar' />,
              },
              {
                path: 'farms',
                Component: FarmsPage
              },
              {
                path: 'farm/:id',
                Component: FarmPage
              },
              {
                path: 'farm-parcels',
                Component: FarmParcelsPage
              },
              {
                path: 'farm-parcel/:id',
                Component: FarmParcelPage
              },
            ]
          },
          /** End of Farm calendar */
          {
            path: 'reporting-service',
            Component: ReportingServicePage
          },
          // ]
          // },
          {
            path: 'irrigation',
            Component: IrrigationPage
          },
          {
            path: 'pest-and-disease',
            Component: PestAndDiseasePage
          },
          {
            path: 'weather-data',
            Component: WeatherDataPage
          },
        ]
      },
      {
        path: '/',
        Component: AuthLayout,
        children: [
          {
            path: 'sign-in',
            Component: SignInPage
          },
          {
            path: 'sign-up',
            Component: SignUpPage
          },
          {
            path: 'session-refresh',
            Component: TokenRefreshPage
          }
        ]
      },
    ]
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <RouterProvider router={router} />
    </LocalizationProvider>
  </StrictMode>,
)
