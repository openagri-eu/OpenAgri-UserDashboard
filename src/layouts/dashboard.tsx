import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import ParcelSelectionModule from '@components/shared/ParcelSelectionModule/ParcelSelectionModule';

export default function DashLayout() {
  return (
    <DashboardLayout>
      <PageContainer>
        <ParcelSelectionModule></ParcelSelectionModule>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}