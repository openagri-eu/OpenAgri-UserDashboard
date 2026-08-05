/**
 * Emission factors for converting activity amounts to CO₂e
 * Units: kg CO₂e per unit of activity
 */

export const EMISSION_FACTORS: Record<string, number> = {
  // Activities - convert applied amounts to CO₂e
  FertilizationOperation: 2.5, // kg CO₂e per kg fertilizer
  CropProtectionOperation: 1.2, // kg CO₂e per liter pesticide
  IrrigationOperation: 0.3, // kg CO₂e per liter water

  // Observations - direct CO₂e values (factor = 1.0)
  Observation: 1.0,
  CropStressIndicatorObservation: 1.0,
  CropGrowthStageObservation: 1.0,
  YieldPredictionObservation: 1.0,
  YieldPrediction: 1.0,

  // Default fallback
  Unknown: 1.0,
};

/**
 * Observation-specific emission factors
 * Maps observation titles/names to their specific emission factors (kg CO₂e per unit)
 * Source: GHG calculation methodology for winery operations
 */
export const OBSERVATION_EMISSION_FACTORS: Record<string, number> = {
  // Winemaking operations
  'Winemaking - Sulphur (SO₂)': 0.000400,
  'Terracota Amphorae': 0.4000,

  // Resource consumption
  'Water consumption': 0.000344,
  'Transport vehicle': 0.2500,
  'Transport (vehicle/distance)': 0.2500,
  'Electricity': 0.3370,
  'Diesel': 2.6600,
  'Diesel - Foliar spray ': 2.6600,
  'Diesel - Soil amendment': 2.6600,
  'Diesel - Plant protection': 2.6600,
  'Diesel combustion_Foliar spraying': 2.6600,
  'Diesel - Mowing / Mulching': 2.6600,
  
  // Refrigeration & cooling
  'Refrigerant leakage_R410A_Quantor PRO Q241R': 2088.0000,
  'Glycol cooling fluid': 1.5000,
  
  // Soil amendments
  'Manure - Compost': 4.2860,
  'Manure-Compost / Soil nitrogen': 4.2860,

  // Infrastructure (25-year lifecycle)
  'Infrastracture - Wire - Steel': 1.3000,
  'Vineyard Wire': 1.3000,
  'Infrastracture - Vineyard stakes - Steel': 1.3000,
  'Infrastracture_Vineyard posts_Steel': 1.3000,

  // Equipment
  'Forklift electric': 0.3370,
  
  // Crop protection
  'Disease Control - Sulphur S': 1.3900,
  'Disease Control - Copper Oxide': 1.9400,
  
  // Carbon sequestration (negative values indicate CO₂ removal)
  'Cover crop / mulching': -0.412500,

  // Composting (on-site waste management)
  'Composted on site - Wine lees': 0.1940,
  'Composted on site - Prunings': 0.1940,
  'Prunings': 0.1940,
  'Composted on site - Grape marc': 0.1940,
  
  // Bottling materials
  'Bottling parametres - DIAM closure': 4.2530,
  'Bottling parameters - Paper label': 1.5000,
  'Bottling parameters - glass bottle': 0.5340,
  'Bottling parameters - Carton case': 0.8000,
};

/**
 * Get emission factor for a given activity/observation type
 * @param type - The @type field from the data object
 * @returns Emission factor to apply
 */
export const getEmissionFactor = (type: string | undefined): number => {
  if (!type) return EMISSION_FACTORS.Unknown;

  // Direct match
  if (EMISSION_FACTORS[type]) {
    return EMISSION_FACTORS[type];
  }

  // Partial match for flexibility
  for (const [key, factor] of Object.entries(EMISSION_FACTORS)) {
    if (type.includes(key)) {
      return factor;
    }
  }

  return EMISSION_FACTORS.Unknown;
};

/**
 * Get observation-specific emission factor by title/name
 * @param title - The observation title or name
 * @returns Observation-specific emission factor, or 1.0 as default
 */
export const getObservationEmissionFactor = (title: string | undefined): number => {
  console.log('getObservationEmissionFactor called with title:', title);
  if (!title) return 0.0;
  
  // Direct match
  if (OBSERVATION_EMISSION_FACTORS[title]) {
    console.log(`Direct match found for title "${title}":`, OBSERVATION_EMISSION_FACTORS[title]);
    return OBSERVATION_EMISSION_FACTORS[title];
  }

  // Partial match for flexibility (case-insensitive)
  const lowerTitle = title.toLowerCase();
  for (const [key, factor] of Object.entries(OBSERVATION_EMISSION_FACTORS)) {
    if (lowerTitle.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTitle)) {
      console.log(`Partial match found for title "${title}" with key "${key}":`, factor);
      return factor;
    }
  }

  return 1.0; // Default factor for unknown observations
};

/**
 * Check if data item is an activity (vs observation)
 * @param data - Data object to check
 * @returns true if activity, false if observation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isActivity = (data: any): boolean => {
  const type = data['@type'] || '';
  return (
    type.includes('Operation') ||
    type === 'FertilizationOperation' ||
    type === 'CropProtectionOperation' ||
    type === 'IrrigationOperation'
  );
};

/**
 * Check if data item is an observation (vs activity)
 * @param data - Data object to check
 * @returns true if observation, false if activity
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObservation = (data: any): boolean => {
  return !isActivity(data);
};
