import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import ParcelSelectionModule from '@components/shared/ParcelSelectionModule/ParcelSelectionModule';
import { Box } from '@mui/material';
import ToolbarActions from '@components/ToolbarActions/ToolbarActions';

export default function DashLayout() {
  return (
    <DashboardLayout
      slots={{
        toolbarActions: ToolbarActions
      }}
    >
      <PageContainer>
        <Box sx={{ marginBottom: 2 }}>
          <ParcelSelectionModule></ParcelSelectionModule>
        </Box>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}