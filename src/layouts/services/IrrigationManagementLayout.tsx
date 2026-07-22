import { Outlet, useOutletContext } from 'react-router';
import { useSession, ServiceActions } from '@contexts/SessionContext';
import { DashboardContextType } from '@layouts/dashboard';
import Redirect from '@components/shared/Redirect/Redirect';

export type ServiceContextType = DashboardContextType & {
  actions: ServiceActions[];
};

export default function IrrigationManagementLayout() {
  const { session } = useSession();
  const context = useOutletContext<DashboardContextType>();

  const service = session?.services?.find(s => s.code === 'IRM');
  const actions = service?.actions || [];

  if (!actions.includes('view')) return <Redirect to="/" />;

  return <Outlet context={{ ...context, actions } as ServiceContextType} />;
}
