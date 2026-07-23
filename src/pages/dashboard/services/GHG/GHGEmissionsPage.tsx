import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Dayjs } from 'dayjs';
import useFetch from '@hooks/useFetch';
import useSnackbar from '@hooks/useSnackbar';
import DateRangeSelect from '@components/shared/DateRangeSelect/DateRangeSelect';
import GenericSelect from '@components/shared/GenericSelect/GenericSelect';
import GenericSnackbar from '@components/shared/GenericSnackbar/GenericSnackbar';
import EmissionsPieChart from '@components/dashboard/services/GHG/EmissionsPieChart';
import { FarmParcelModel } from '@models/FarmParcel';
import { calculateGHG } from '@utils/calculateGHG';
import { useSession } from '@contexts/SessionContext';
import CalculateIcon from '@mui/icons-material/Calculate';

type GHGObservation = Record<string, any>;

interface ParcelGHGData {
  parcelId: string;
  parcelName: string;
  observations: GHGObservation[];
  totalGHG: number;
}

const GHGEmissionsPage = () => {
  // State for selections
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [allObservations, setAllObservations] = useState<GHGObservation[]>([]);
  const [ghgResults, setGhgResults] = useState<{
    totalGHG: number;
    parcels: ParcelGHGData[];
  } | null>(null);

  const { session } = useSession();

  // Fetch available parcels
  const { fetchData: fetchParcels, response: parcelsData } = useFetch<
    FarmParcelModel[]
  >('proxy/farmcalendar/api/v1/FarmParcels/?format=json', { method: 'GET' });

  const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleCalculateGHG = async () => {
    if (selectedParcels.length === 0 || !fromDate || !toDate) {
      showSnackbar('warning', 'Please select at least one parcel and date range');
      return;
    }

    setLoadingCalculation(true);
    setGhgResults(null);

    try {
      const observations: GHGObservation[] = [];
      const parcelResults: ParcelGHGData[] = [];

      // Fetch observations for each selected parcel
      for (const parcelId of selectedParcels) {
        const parcel = parcelsData?.find((p) => p['@id'] === parcelId);
        const parcelName = parcel?.identifier || parcelId;

        const params = new URLSearchParams({
          format: 'json',
          parcel: parcelId.split(':')[3] || parcelId,
          from_date: fromDate.format('YYYY-MM-DD'),
          to_date: toDate.format('YYYY-MM-DD'),
        });

        const response = await fetch(
          `${window.env?.VITE_API_URL || import.meta.env.VITE_API_URL}proxy/farmcalendar/api/v1/Observations/?${params}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session?.user?.token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) continue;

        const data = await response.json();

        let parcelObservations: GHGObservation[] = [];
        if (Array.isArray(data)) parcelObservations = data;
        else if (data.results) parcelObservations = data.results;
        else if (data.data) parcelObservations = data.data;
        else if (data.observations) parcelObservations = data.observations;

        observations.push(...parcelObservations);

        const parcelTotalGHG = calculateGHG(parcelObservations);
        parcelResults.push({
          parcelId,
          parcelName,
          observations: parcelObservations,
          totalGHG: parcelTotalGHG,
        });
      }

      console.log('Fetched Observations:', observations);
      console.log('Parcel Results:', parcelResults);

      if (observations.length === 0) {
        showSnackbar('info', 'No GHG observations found for the selected period and parcels');
        setLoadingCalculation(false);
        return;
      }

      const totalGHG = calculateGHG(observations);
      setAllObservations(observations);
      setGhgResults({
        totalGHG,
        parcels: parcelResults,
      });

      console.log('Total GHG Emissions:', totalGHG);

      showSnackbar('success', 'GHG calculation completed');
    } catch (error) {
      console.error('Error calculating GHG:', error);
      showSnackbar('error', 'Error calculating GHG emissions');
    } finally {
      setLoadingCalculation(false);
      console.log('GHG calculation process completed');
    }
  };

  const handleClearResults = () => {
    setGhgResults(null);
    setAllObservations([]);
    setSelectedParcels([]);
    setFromDate(null);
    setToDate(null);
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Input Card */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            GHG Emissions Calculator
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select parcels and time period to calculate GHG emissions
          </Typography>

          {/* Parcel Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select Parcels (multiple selection)
            </Typography>
            <GenericSelect<FarmParcelModel>
              endpoint="proxy/farmcalendar/api/v1/FarmParcels/?format=json"
              label="Parcels"
              multiple={true}
              selectedValue={selectedParcels}
              setSelectedValue={setSelectedParcels}
              getOptionLabel={(parcel) => parcel.identifier}
              getOptionValue={(parcel) => parcel['@id']}
              data={parcelsData}
            />
          </Box>

          {/* Winery Selection - Commented out for future use */}
          {/* <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Or Select Winery
            </Typography>
            <GenericSelect
              label="Winery"
              options={wineriesData || []}
              value={selectedWinery}
              onChange={(value) => setSelectedWinery(value as string)}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option['@id']}
            />
          </Box> */}

          {/* Date Range Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Time Period
            </Typography>
            <DateRangeSelect
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
          </Box>

          {/* Calculate Button */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={loadingCalculation ? <CircularProgress size={20} /> : <CalculateIcon />}
              onClick={handleCalculateGHG}
              disabled={loadingCalculation || selectedParcels.length === 0 || !fromDate || !toDate}
              fullWidth
            >
              {loadingCalculation ? 'Calculating...' : 'Calculate GHG Emissions'}
            </Button>
            {ghgResults && (
              <Button variant="outlined" onClick={handleClearResults} sx={{ minWidth: 120 }}>
                Clear
              </Button>
            )}
          </Box>

          {/* Selection Summary */}
          {selectedParcels.length > 0 && fromDate && toDate && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                <strong>Selection Summary:</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedParcels.map((parcelId) => {
                  const parcel = parcelsData?.find((p) => p['@id'] === parcelId);
                  return (
                    <Chip
                      key={parcelId}
                      label={parcel?.identifier || parcelId}
                      size="small"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Period: {fromDate.format('DD/MM/YYYY')} to {toDate.format('DD/MM/YYYY')}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {ghgResults && (
        <>
          {/* Total GHG Card */}
          <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Total GHG Emissions
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                {ghgResults.totalGHG.toFixed(2)} kg CO₂e
              </Typography>
              <Typography variant="caption" color="text.secondary">
                From {selectedParcels.length} parcel{selectedParcels.length !== 1 ? 's' : ''} over{' '}
                {fromDate?.diff(toDate, 'day') || 0} days
              </Typography>
            </CardContent>
          </Card>

          {/* Parcel Breakdown */}
          {ghgResults.parcels.length > 1 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Emissions by Parcel
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {ghgResults.parcels.map((parcelData) => (
                    <Box
                      key={parcelData.parcelId}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">{parcelData.parcelName}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: 100, textAlign: 'right' }}>
                          <strong>{parcelData.totalGHG.toFixed(2)} kg CO₂e</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>
                          {((parcelData.totalGHG / ghgResults.totalGHG) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Pie Chart */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Emissions Sources (Top 3)
              </Typography>
              <EmissionsPieChart observations={allObservations} groupingField="title" />
            </CardContent>
          </Card>

          {/* Observations Table */}
          {allObservations.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Observations Used ({allObservations.length})
                </Typography>
                <Box
                  sx={{
                    maxHeight: 400,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {allObservations.map((obs, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        borderLeft: '4px solid',
                        borderColor: 'info.main',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {obs.title || obs.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {obs.phenomenonTime || obs.timestamp || 'N/A'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {(Number(obs.hasResult?.hasValue ?? 0) || 0).toFixed(2)} kg CO₂e
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!ghgResults && selectedParcels.length === 0 && (
        <Alert severity="info">
          Select parcels and a date range, then click "Calculate GHG Emissions" to get started.
        </Alert>
      )}

      <GenericSnackbar
        type={snackbarState.type}
        message={snackbarState.message}
        open={snackbarState.open}
        onClose={closeSnackbar}
      />
    </Box>
  );
};

export default GHGEmissionsPage;
