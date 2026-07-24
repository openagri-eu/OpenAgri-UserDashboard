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
