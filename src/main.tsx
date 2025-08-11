import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router';

import Redirect from '@components/shared/Redirect/Redirect.tsx';

import DashLayout from './layouts/dashboard.tsx';
import LandingPage from '@pages/dashboard/LandingPage/LandingPage.tsx';
import FarmCalendarPage from '@pages/dashboard/Services/FarmCalendar.tsx';
import IrrigationPage from '@pages/dashboard/Services/Irrigation.tsx';
import PestAndDiseasePage from '@pages/dashboard/Services/PestAndDisease.tsx';
import ReportingServicePage from '@pages/dashboard/Services/ReportingService.tsx';
import WeatherDataPage from '@pages/dashboard/Services/WeatherData.tsx';
import AuthLayout from '@layouts/auth.tsx';
import SignInPage from '@pages/auth/SignIn/SignInPage.tsx';
import SignUpPage from '@pages/auth/SignUp/SignUpPage.tsx';

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
          {
            path: 'farm-calendar',
            children: [
              {
                index: true, // When the parent route is accessed directly
                element: <Redirect to='farm-calendar/farm-calendar' />,
              },
              {
                path: 'farm-calendar',
                Component: FarmCalendarPage
              },
              {
                path: 'reporting-service',
                Component: ReportingServicePage
              },
            ]
          },
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
          }
        ]
      },
    ]
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
