import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Dayjs } from 'dayjs';
import useFetch from '@hooks/useFetch';
import useSnackbar from '@hooks/useSnackbar';
import DateRangeSelect from '@components/shared/DateRangeSelect/DateRangeSelect';
import GenericSelect from '@components/shared/GenericSelect/GenericSelect';
import GenericSnackbar from '@components/shared/GenericSnackbar/GenericSnackbar';
import EmissionsPieChart from '@components/dashboard/services/GHG/EmissionsPieChart';
import { FarmParcelModel } from '@models/FarmParcel';
import {
  normalizeGHGDataArray,
  aggregateGHGByEntity,
} from '@utils/calculateGHG';
import { useSession } from '@contexts/SessionContext';
import CalculateIcon from '@mui/icons-material/Calculate';
import PrintIcon from '@mui/icons-material/Print';
import { AggregatedGHGResults, SourceAPI, NormalizedGHGData } from '@/types/GHGData';

const GHGEmissionsPage = () => {
  // State for winery selections
  const [selectedWineries, setSelectedWineries] = useState<string[]>([]);
  const [wineryFromDate, setWineryFromDate] = useState<Dayjs | null>(null);
  const [wineryToDate, setWineryToDate] = useState<Dayjs | null>(null);

  // State for parcel selections
  const [selectedParcels, setSelectedParcels] = useState<string[]>([]);
  const [parcelFromDate, setParcelFromDate] = useState<Dayjs | null>(null);
  const [parcelToDate, setParcelToDate] = useState<Dayjs | null>(null);

  // State for results
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [ghgResults, setGhgResults] = useState<AggregatedGHGResults | null>(null);
  const summaryPrintRef = useRef<HTMLDivElement | null>(null);

  const { session } = useSession();

  // Fetch available parcels
  const { fetchData: fetchParcels, response: parcelsData } = useFetch<
    FarmParcelModel[]
  >('proxy/farmcalendar/api/v1/FarmParcels/?format=json', { method: 'GET' });

  // Fetch available wineries
  const { fetchData: fetchWineries, response: wineriesData } = useFetch<
    FarmParcelModel[]
  >('proxy/farmcalendar/api/v1/FarmParcels/?parcel_type=Winery&format=json', { method: 'GET' });

  const { snackbarState, showSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    fetchParcels();
    fetchWineries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalculateGHG = async () => {
    // Validation
    const hasWineries = selectedWineries.length > 0 && wineryFromDate && wineryToDate;
    const hasParcels = selectedParcels.length > 0 && parcelFromDate && parcelToDate;

    if (!hasWineries && !hasParcels) {
      showSnackbar('warning', 'Please select at least one winery or parcel with date range');
      return;
    }

    setLoadingCalculation(true);
    setGhgResults(null);

    // API endpoints to fetch from
    const API_ENDPOINTS: Array<{ path: string; sourceAPI: SourceAPI }> = [
      { path: '/api/v1/Observations/', sourceAPI: 'Observations' },
      { path: '/api/v1/FertilizationOperations/', sourceAPI: 'FertilizationOperations' },
      { path: '/api/v1/CropProtectionOperations/', sourceAPI: 'CropProtectionOperations' },
      { path: '/api/v1/IrrigationOperations/', sourceAPI: 'IrrigationOperations' },
      { path: '/api/v1/YieldPrediction/', sourceAPI: 'YieldPrediction' },
      { path: '/api/v1/CropGrowthStageObservations/', sourceAPI: 'CropGrowthStageObservations' },
      { path: '/api/v1/CropStressIndicatorObservations/', sourceAPI: 'CropStressIndicatorObservations' },
    ];

    /**
     * Fetch data from a single API endpoint for a specific entity
     */
    const fetchFromAPI = async (
      endpoint: string,
      entityId: string,
      fromDate: Dayjs,
      toDate: Dayjs
    ): Promise<NormalizedGHGData['originalData'][]> => {
      try {
        const parcelUUID = entityId.split(':')[3] || entityId;
        const params = new URLSearchParams({
          format: 'json',
          parcel: parcelUUID,
          from_date: fromDate.format('YYYY-MM-DD'),
          to_date: toDate.format('YYYY-MM-DD'),
        });

        const response = await fetch(
          `${window.env?.VITE_API_URL || import.meta.env.VITE_API_URL}proxy/farmcalendar${endpoint}?${params}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session?.user?.token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) return [];

        const data = await response.json();

        // Handle different response structures
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let items: any[] = [];
        if (Array.isArray(data)) items = data;
        else if (data.results) items = data.results;
        else if (data.data) items = data.data;
        else if (data.observations) items = data.observations;

        return items;
      } catch (error) {
        console.error(`Error fetching from ${endpoint} for ${entityId}:`, error);
        return [];
      }
    };

    try {
      const allNormalizedData: NormalizedGHGData[] = [];
      const entityNames: Record<string, string> = {};

      // Fetch data for wineries
      if (hasWineries && wineryFromDate && wineryToDate) {
        for (const wineryId of selectedWineries) {
          const winery = wineriesData?.find((w) => w['@id'] === wineryId);
          const wineryName = winery?.identifier || wineryId;
          entityNames[wineryId] = wineryName;

          // Fetch from all APIs in parallel for this winery
          const fetchPromises = API_ENDPOINTS.map((api) =>
            fetchFromAPI(api.path, wineryId, wineryFromDate, wineryToDate)
          );

          const results = await Promise.all(fetchPromises);

          // Normalize and add to collection
          results.forEach((apiData, index) => {
            const sourceAPI = API_ENDPOINTS[index].sourceAPI;
            const normalized = normalizeGHGDataArray(apiData, wineryId, 'winery', sourceAPI);
            allNormalizedData.push(...normalized);
          });
        }
      }

      // Fetch data for parcels
      if (hasParcels && parcelFromDate && parcelToDate) {
        for (const parcelId of selectedParcels) {
          const parcel = parcelsData?.find((p) => p['@id'] === parcelId);
          const parcelName = parcel?.identifier || parcelId;
          entityNames[parcelId] = parcelName;

          // Fetch from all APIs in parallel for this parcel
          const fetchPromises = API_ENDPOINTS.map((api) =>
            fetchFromAPI(api.path, parcelId, parcelFromDate, parcelToDate)
          );

          const results = await Promise.all(fetchPromises);

          // Normalize and add to collection
          results.forEach((apiData, index) => {
            const sourceAPI = API_ENDPOINTS[index].sourceAPI;
            const normalized = normalizeGHGDataArray(apiData, parcelId, 'parcel', sourceAPI);
            allNormalizedData.push(...normalized);
          });
        }
      }

      console.log('All Normalized Data:', allNormalizedData);

      if (allNormalizedData.length === 0) {
        showSnackbar('info', 'No GHG data found for the selected entities and date ranges');
        setLoadingCalculation(false);
        return;
      }

      // Aggregate results
      const aggregated = aggregateGHGByEntity(allNormalizedData, entityNames);
      setGhgResults(aggregated);

      console.log('Aggregated GHG Results:', aggregated);
      showSnackbar('success', 'GHG calculation completed');
    } catch (error) {
      console.error('Error calculating GHG:', error);
      showSnackbar('error', 'Error calculating GHG emissions');
    } finally {
      setLoadingCalculation(false);
    }
  };

  const handleClearResults = () => {
    setGhgResults(null);
    setSelectedWineries([]);
    setSelectedParcels([]);
    setWineryFromDate(null);
    setWineryToDate(null);
    setParcelFromDate(null);
    setParcelToDate(null);
  };

  const handleExportPdf = async () => {
    if (!ghgResults || !summaryPrintRef.current) {
      return;
    }

    setLoadingPdf(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(summaryPrintRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let remainingHeight = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      remainingHeight -= pdfHeight - 20;

      while (remainingHeight > 0) {
        position = remainingHeight - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        remainingHeight -= pdfHeight - 20;
      }

      const dateStamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
      pdf.save(`ghg-summary-${dateStamp}.pdf`);
      showSnackbar('success', 'GHG summary PDF generated');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showSnackbar('error', 'Error generating summary PDF');
    } finally {
      setLoadingPdf(false);
    }
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
            Select wineries and/or parcels with their respective date ranges to calculate GHG emissions
          </Typography>

          {/* Winery Selection Section */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'secondary.light', borderRadius: 1, border: '1px solid', borderColor: 'primary.main' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Wineries
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select Wineries (multiple selection)
              </Typography>
              <GenericSelect<FarmParcelModel>
                endpoint="proxy/farmcalendar/api/v1/FarmParcels/?parcel_type=Winery&format=json"
                label="Wineries"
                multiple={true}
                selectedValue={selectedWineries}
                setSelectedValue={setSelectedWineries}
                getOptionLabel={(winery) => winery.identifier}
                getOptionValue={(winery) => winery['@id']}
                data={wineriesData}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Winery Time Period
              </Typography>
              <DateRangeSelect
                fromDate={wineryFromDate}
                setFromDate={setWineryFromDate}
                toDate={wineryToDate}
                setToDate={setWineryToDate}
              />
            </Box>
            {selectedWineries.length > 0 && wineryFromDate && wineryToDate && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  <strong>Selected Wineries:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedWineries.map((wineryId) => {
                    const winery = wineriesData?.find((w) => w['@id'] === wineryId);
                    return (
                      <Chip
                        key={wineryId}
                        label={winery?.identifier || wineryId}
                        size="small"
                        variant="filled"
                        color="primary"
                      />
                    );
                  })}
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Period: {wineryFromDate.format('DD/MM/YYYY')} to {wineryToDate.format('DD/MM/YYYY')}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }}>AND / OR</Divider>

          {/* Parcel Selection Section */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'secondary.light', borderRadius: 1, border: '1px solid', borderColor: 'secondary.main' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Parcels
            </Typography>
            <Box sx={{ mb: 2 }}>
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
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Parcel Time Period
              </Typography>
              <DateRangeSelect
                fromDate={parcelFromDate}
                setFromDate={setParcelFromDate}
                toDate={parcelToDate}
                setToDate={setParcelToDate}
              />
            </Box>
            {selectedParcels.length > 0 && parcelFromDate && parcelToDate && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  <strong>Selected Parcels:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedParcels.map((parcelId) => {
                    const parcel = parcelsData?.find((p) => p['@id'] === parcelId);
                    return (
                      <Chip
                        key={parcelId}
                        label={parcel?.identifier || parcelId}
                        size="small"
                        variant="filled"
                        color="primary"
                      />
                    );
                  })}
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Period: {parcelFromDate.format('DD/MM/YYYY')} to {parcelToDate.format('DD/MM/YYYY')}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Calculate Button */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={loadingCalculation ? <CircularProgress size={20} /> : <CalculateIcon />}
              onClick={handleCalculateGHG}
              disabled={
                loadingCalculation ||
                (selectedWineries.length === 0 || !wineryFromDate || !wineryToDate) &&
                (selectedParcels.length === 0 || !parcelFromDate || !parcelToDate)
              }
              fullWidth
            >
              {loadingCalculation ? 'Calculating...' : 'Calculate GHG Emissions'}
            </Button>
            {ghgResults && (
              <>
                <Button
                  variant="outlined"
                  startIcon={loadingPdf ? <CircularProgress size={16} /> : <PrintIcon />}
                  onClick={handleExportPdf}
                  disabled={loadingPdf}
                  sx={{ minWidth: 140 }}
                >
                  {loadingPdf ? 'Exporting...' : 'Print PDF'}
                </Button>
                <Button variant="outlined" onClick={handleClearResults} sx={{ minWidth: 120 }}>
                  Clear
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Results Section */}
      {ghgResults && (
        <>
          <Box ref={summaryPrintRef} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Selected Date Ranges
                </Typography>
                {selectedWineries.length > 0 && wineryFromDate && wineryToDate && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Wineries: {wineryFromDate.format('DD/MM/YYYY')} to {wineryToDate.format('DD/MM/YYYY')}
                  </Typography>
                )}
                {selectedParcels.length > 0 && parcelFromDate && parcelToDate && (
                  <Typography variant="body2">
                    Parcels: {parcelFromDate.format('DD/MM/YYYY')} to {parcelToDate.format('DD/MM/YYYY')}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Grand Total GHG Card */}
            <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Total GHG Emissions (All Entities)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {ghgResults.grandTotal.toFixed(2)} kg CO₂e
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ghgResults.wineries.length > 0 && `${ghgResults.wineries.length} winery(ies) | `}
                  {ghgResults.parcels.length > 0 && `${ghgResults.parcels.length} parcel(s)`}
                </Typography>
              </CardContent>
            </Card>

            {/* Winery Results Section */}
            {ghgResults.wineries.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom >
                    Winery Emissions
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {ghgResults.wineryTotal.toFixed(2)} kg CO₂e
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {ghgResults.wineries.map((wineryData) => (
                      <Box
                        key={wineryData.entityId}
                        sx={{
                          p: 2,
                          bgcolor: 'primary.light',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {wineryData.entityName}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {wineryData.totalGHG.toFixed(2)} kg CO₂e
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {Object.entries(wineryData.sourceBreakdown).map(([source, value]) => (
                            value > 0 && (
                              <Chip
                                key={source}
                                label={`${source}: ${value.toFixed(2)} kg CO₂e`}
                                size="small"
                                variant="outlined"
                              />
                            )
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Parcel Results Section */}
            {ghgResults.parcels.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Parcel Emissions
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {ghgResults.parcelTotal.toFixed(2)} kg CO₂e
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {ghgResults.parcels.map((parcelData) => (
                      <Box
                        key={parcelData.entityId}
                        sx={{
                          p: 2,
                          bgcolor: 'primary.light',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {parcelData.entityName}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {parcelData.totalGHG.toFixed(2)} kg CO₂e
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {Object.entries(parcelData.sourceBreakdown).map(([source, value]) => (
                            value > 0 && (
                              <Chip
                                key={source}
                                label={`${source}: ${value.toFixed(2)} kg CO₂e`}
                                size="small"
                                variant="outlined"
                              />
                            )
                          ))}
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
                  Emissions Sources Distribution
                </Typography>
                <EmissionsPieChart
                  observations={ghgResults.allNormalizedData}
                  groupingField="@type"
                />
              </CardContent>
            </Card>
          </Box>

          {/* Data Items Table */}
          {ghgResults.allNormalizedData.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  All Data Items ({ghgResults.allNormalizedData.length})
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
                  {ghgResults.allNormalizedData.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        borderLeft: '4px solid',
                        borderColor: item.entityType === 'winery' ? 'primary.main' : 'secondary.main',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {item.title || item['@type'] || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.phenomenonTime || item.timestamp || 'N/A'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={item.entityType}
                              size="small"
                              color={item.entityType === 'winery' ? 'primary' : 'secondary'}
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                            <Chip
                              label={item.dataType}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                            <Chip
                              label={item.sourceAPI}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {item.ghgValue.toFixed(2)} kg CO₂e
                          </Typography>
                          {item.emissionFactor !== 1 && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              ({item.rawValue.toFixed(2)} × {item.emissionFactor})
                            </Typography>
                          )}
                        </Box>
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
      {!ghgResults && selectedWineries.length === 0 && selectedParcels.length === 0 && (
        <Alert severity="info">
          Select wineries and/or parcels with their respective date ranges, then click "Calculate GHG Emissions" to get started.
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
