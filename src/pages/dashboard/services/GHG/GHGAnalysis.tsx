import { Box, Card, CardContent, Typography } from '@mui/material';
import EmissionsPieChart from '@components/dashboard/services/GHG/EmissionsPieChart';

const GHGAnalysisPage = () => {
  return (
    <Box display={'flex'} flexDirection={'column'} gap={3}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">GHG (GreenHouseGas) Analysis</Typography>
          <Box mt={2}>
            <EmissionsPieChart groupingField="type" />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GHGAnalysisPage;
