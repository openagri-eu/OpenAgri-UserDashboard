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
import WKTInputPage from '@pages/dashboard/services/Irrigation/WKTInput.tsx';
import PestAndDiseasePage from '@pages/dashboard/services/PestAndDisease/PestAndDisease.tsx';
import CompostOperationsReportPage from '@pages/dashboard/services/FarmCalendar/ReportingService/CompostOperations.tsx';
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
import EToCalculatorPage from '@pages/dashboard/services/Irrigation/EToCalculator.tsx';
import UploadDatasetPage from '@pages/dashboard/services/Irrigation/UploadDataset.tsx';
import SoilMoistureAnalysisPage from '@pages/dashboard/services/Irrigation/SoilMoistureAnalysis.tsx';
import IrrigationOperationsReportPage from '@pages/dashboard/services/FarmCalendar/ReportingService/IrrigationOperations.tsx';
import FarmAnimalsReportPage from '@pages/dashboard/services/FarmCalendar/ReportingService/FarmAnimals.tsx';
import DiseasesPage from '@pages/dashboard/services/PestAndDisease/Diseases.tsx';

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
                element: <Redirect to='farm-locations/farms' />,
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
            children: [
              {
                index: true,
                element: <Redirect to='reporting-service/compost-operations' />,
              },
              {
                path: 'compost-operations',
                Component: CompostOperationsReportPage
              },
              {
                path: 'farm-animals',
                Component: FarmAnimalsReportPage
              },
              {
                path: 'irrigation-operations',
                Component: IrrigationOperationsReportPage
              },
            ]
          },
          // ]
          // },
          {
            path: 'wkt-input',
            Component: WKTInputPage
          },
          {
            path: 'eto-calculator',
            Component: EToCalculatorPage
          },
          {
            path: 'upload-dataset',
            Component: UploadDatasetPage
          },
          {
            path: 'soil-moisture-analysis',
            Component: SoilMoistureAnalysisPage
          },
          {
            path: 'diseases',
            Component: DiseasesPage
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
