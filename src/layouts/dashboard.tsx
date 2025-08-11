import { Outlet, useLocation } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import ParcelSelectionModule from '@components/dashboard/ParcelSelectionModule/ParcelSelectionModule';
import { Box } from '@mui/material';
import ToolbarActions from '@components/dashboard/ToolbarActions/ToolbarActions';
import { useSession } from '@contexts/SessionContext';
import Redirect from '@components/shared/Redirect/Redirect';
import { jwtDecode } from 'jwt-decode';

export default function DashLayout() {
  const { session } = useSession()
  const location = useLocation();

  const redirectTo =
    `/sign-in?callbackURL=${encodeURIComponent(location.pathname)}`;

  if (!session || !session.user || !session.user.token) {
    return <Redirect to={redirectTo} />;
  } else {
    try {
      // Decode the token to get its payload
      const decodedToken = jwtDecode(session.user.token);

      // Check if the token has expired
      if ((decodedToken.exp ?? 0) < Date.now() / 1000) {
        console.log("token expired");
        // Token has expired; TODO: make use of refresh token here 
        return <Redirect to={redirectTo} />;
      }
    } catch (error) {
      // Token is invalid; redirect to sign-in
      console.log("token invalid");
      return <Redirect to={redirectTo} />;
    }
  }

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