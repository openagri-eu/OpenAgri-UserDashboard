import { Outlet, useLocation } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Breadcrumb, PageContainer } from '@toolpad/core/PageContainer';
import ToolbarActions from '@components/dashboard/ToolbarActions/ToolbarActions';
import { useAuth0 } from '@auth0/auth0-react';
import Footer from '@components/shared/Footer';
import { useState } from 'react';
import { CircularProgress, Box } from '@mui/material';

export type DashboardContextType = {
  setPageTitle: (title: string | undefined) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[] | undefined) => void;
};

export default function DashLayout() {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  const [pageTitle, setPageTitle] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[] | undefined>(undefined);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    window.location.href = `/sign-in?callbackURL=${encodeURIComponent(location.pathname)}`;
    return null; 
  }

  return (
    <DashboardLayout
      slots={{
        toolbarActions: ToolbarActions
      }}
    >
      <PageContainer title={pageTitle} breadcrumbs={breadcrumbs}>
        <Outlet context={{ setPageTitle, setBreadcrumbs }} />
      </PageContainer>
      <Footer />
    </DashboardLayout>
  );
}