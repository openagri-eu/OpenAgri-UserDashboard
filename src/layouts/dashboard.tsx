import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import ParcelSelectionModule from '@components/shared/ParcelSelectionModule/ParcelSelectionModule';
import { Box } from '@mui/material';

export default function DashLayout() {
  return (
    <DashboardLayout>
      <PageContainer>
        <Box sx={{ marginBottom: 2 }}>
          <ParcelSelectionModule></ParcelSelectionModule>
        </Box>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}