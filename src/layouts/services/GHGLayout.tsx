import { Outlet, useOutletContext } from 'react-router';
import { ServiceActions } from '@contexts/SessionContext';
// import { useSession, ServiceActions } from '@contexts/SessionContext';
import { DashboardContextType } from '@layouts/dashboard';
// import Redirect from '@components/shared/Redirect/Redirect';

export type ServiceContextType = DashboardContextType & {
  actions: ServiceActions[];
};

export default function GHGLayout() {
//   const { session } = useSession();
  const context = useOutletContext<DashboardContextType>();

//   const service = session?.services?.find(s => s.code === 'GHG');
//   const actions = service?.actions || [];

//   if (!actions.includes('view')) return <Redirect to="/" />;
  const actions: ServiceActions[] = ['view', 'add', 'edit', 'delete']; // Temporary hardcoded actions for GHG service

  return <Outlet context={{ ...context, actions } as ServiceContextType} />;
}
