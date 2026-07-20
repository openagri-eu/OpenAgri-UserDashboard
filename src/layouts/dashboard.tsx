import { Outlet, useLocation, useNavigate } from 'react-router';
import { DashboardLayout, DashboardSidebarPageItem } from '@toolpad/core/DashboardLayout';
import type { NavigationPageItem } from '@toolpad/core/AppProvider';
import { Breadcrumb, PageContainer } from '@toolpad/core/PageContainer';
import ToolbarActions from '@components/dashboard/ToolbarActions/ToolbarActions';
import { useSession } from '@contexts/SessionContext';
import Redirect from '@components/shared/Redirect/Redirect';
import { jwtDecode } from 'jwt-decode';
import Footer from '@components/shared/Footer';
import { useEffect, useState, useCallback } from 'react';
import useFetch from '@hooks/useFetch';
import { clearUserCaches } from '@utils/pwaCache';

export type DashboardContextType = {
  setPageTitle: (title: string | undefined) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[] | undefined) => void;
};

const MOCK_SERVICES_RESPONSE = [
  {
    "code": "FC",
    "name": "Farm Calendar",
    "roles": [
      "admin"
    ],
    "actions": [
      "add",
      "delete",
      "edit",
      "view"
    ],
    "scopes": {
      "farm": [
        "00000000-0000-0000-0000-000000000001"
      ],
      "parcel": [
        "00000000-0000-0000-0000-000000000001",
        "00000000-0000-0000-0000-000000000002",
        "00000000-0000-0000-0000-000000000003"
      ]
    },
    "assignments": [
      {
        "role": "admin",
        "actions": [
          "add",
          "delete",
          "edit",
          "view"
        ],
        "scope_type": "farm",
        "scope_id": "00000000-0000-0000-0000-000000000001",
        "source": "superuser"
      },
      {
        "role": "admin",
        "actions": [
          "add",
          "delete",
          "edit",
          "view"
        ],
        "scope_type": "parcel",
        "scope_id": "00000000-0000-0000-0000-000000000001",
        "source": "superuser"
      },
      {
        "role": "admin",
        "actions": [
          "add",
          "delete",
          "edit",
          "view"
        ],
        "scope_type": "parcel",
        "scope_id": "00000000-0000-0000-0000-000000000002",
        "source": "superuser"
      },
      {
        "role": "admin",
        "actions": [
          "add",
          "delete",
          "edit",
          "view"
        ],
        "scope_type": "parcel",
        "scope_id": "00000000-0000-0000-0000-000000000003",
        "source": "superuser"
      }
    ],
    "unrestricted": true
  },
  {
    "code": "IRM",
    "name": "Irrigation Management",
    "roles": [],
    "actions": [
      "add",
      "delete",
      "edit",
      "view"
    ],
    "scopes": {},
    "assignments": [],
    "unrestricted": true
  },
  {
    "code": "PDM",
    "name": "Pest & Disease Management",
    "roles": [],
    "actions": [
      "add",
      "delete",
      // "edit",
      "view"
    ],
    "scopes": {},
    "assignments": [],
    "unrestricted": true
  },
  {
    "code": "RP",
    "name": "Reporting",
    "roles": [],
    "actions": [
      "add",
      "delete",
      "edit",
      "view"
    ],
    "scopes": {},
    "assignments": [],
    "unrestricted": true
  },
  {
    "code": "WD",
    "name": "Weather Data",
    "roles": [],
    "actions": [],
    "scopes": {},
    "assignments": [],
    "unrestricted": true
  }
];

export default function DashLayout() {
  const { session, setSession } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const [pageTitle, setPageTitle] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[] | undefined>(undefined);

  const { fetchData, response, error } = useFetch<any>(
    "me/",
    {
      method: 'GET',
    }
  );

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (session && response) {
      setSession(prevSession => {
        if (prevSession) {
          return {
            ...prevSession,
            services: MOCK_SERVICES_RESPONSE as any
            // services: response.services
          };
        }
        return null;
      });
    }
  }, [response])

  useEffect(() => {
    if (error) {
      if (!navigator.onLine) return;
      clearUserCaches().finally(() => {
        setSession(null);
        navigate("/");
      });
    }
  }, [error])

  const renderPageItem = useCallback(
    (item: NavigationPageItem) => {
      if ((item as any).disabled) {
        return <DashboardSidebarPageItem item={item} disabled />;
      }
      return <DashboardSidebarPageItem item={item} />;
    },
    [],
  );

  const callbackURL =
    `?callbackURL=${encodeURIComponent(location.pathname)}`;

  if (!session || !session.user || !session.user.token) {
    return <Redirect to={'/sign-in' + callbackURL} />;
  } else {
    try {
      // Decode the token to get its payload
      const decodedToken = jwtDecode(session.user.token);

      if ((decodedToken.exp ?? 0) < Date.now() / 1000) {
        if (navigator.onLine) {
          return <Redirect to={'/session-refresh' + callbackURL} />;
        }
      }
    } catch (error) {
      // Token is invalid; redirect to sign-in
      return <Redirect to={'/sign-in' + callbackURL} />;
    }
  }

  return (
    <DashboardLayout
      renderPageItem={renderPageItem}
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