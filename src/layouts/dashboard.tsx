import { Outlet, useLocation, useNavigate } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Breadcrumb, PageContainer } from '@toolpad/core/PageContainer';
import ToolbarActions from '@components/dashboard/ToolbarActions/ToolbarActions';
import { useSession } from '@contexts/SessionContext';
import Redirect from '@components/shared/Redirect/Redirect';
import { jwtDecode } from 'jwt-decode';
import Footer from '@components/shared/Footer';
import { useEffect, useState } from 'react';
import useFetch from '@hooks/useFetch';

export type DashboardContextType = {
  setPageTitle: (title: string | undefined) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[] | undefined) => void;
};

export default function DashLayout() {
  const { session, setSession } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const { fetchData, response, error } = useFetch<any>(
    "me/",
    {
      method: 'GET',
    }
  );

  useEffect(() => {
    if (session) {
      console.log("in session fetch", session);
      
      // fetchData();
    }
  }, []);


  useEffect(() => {
    if (session && response) {
      setSession(prevSession => {
        if (prevSession) {
          return {
            ...prevSession,
            services: response.services
          };
        }
        return null;
      });
    }
  }, [response])

  useEffect(() => {
    if (error) {
      setSession(null);
      navigate("/");
    }
  }, [error])

  const callbackURL =
    `?callbackURL=${encodeURIComponent(location.pathname)}`;

  if (!session || !session.user || !session.user.token) {
    return <Redirect to={'/sign-in' + callbackURL} />;
  } else {
    try {
      // Decode the token to get its payload
      const decodedToken = jwtDecode(session.user.token);

      // Check if the token has expired
      if ((decodedToken.exp ?? 0) < Date.now() / 1000) {
        return <Redirect to={'/session-refresh' + callbackURL} />;
      }
    } catch (error) {
      // Token is invalid; redirect to sign-in
      return <Redirect to={'/sign-in' + callbackURL} />;
    }
  }

  const [pageTitle, setPageTitle] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[] | undefined>(undefined);

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