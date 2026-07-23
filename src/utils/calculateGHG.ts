/**
 * Represents a GHG observation data structure
 */
export interface GHGObservation {
  [key: string]: any;
  value?: number;
  amount?: number;
  type?: string;
}

/**
 * Calculates total GHG emissions from observations array
 * @param observations - Array of GHG observation objects
 * @returns Total GHG emissions value
 */
export const calculateGHG = (observations: GHGObservation[]): number => {
  if (!Array.isArray(observations) || observations.length === 0) {
    return 0;
  }

  return observations.reduce((total, observation) => {
    const value = Number(observation.hasResult?.hasValue ?? 0) || 0;
    return total + value;
  }, 0);
};

/**
 * Groups observations by a specific field and calculates sums
 * @param observations - Array of GHG observation objects
 * @param groupingField - Field to group by (default: 'type')
 * @returns Object with grouped sums
 */
export const groupObservationsByField = (
  observations: GHGObservation[],
  groupingField: string = '@type'
): Record<string, number> => {
  const sums: Record<string, number> = {};

  observations.forEach((observation) => {
    const key = observation[groupingField] ?? 'Unknown';
    const value = Number(observation.hasResult?.hasValue ?? 0) || 0;
    sums[key] = (sums[key] || 0) + value;
  });

  return sums;
};

/**
 * Gets top N emission sources by value
 * @param observations - Array of GHG observation objects
 * @param topN - Number of top sources to return (default: 3)
 * @param groupingField - Field to group by (default: 'type')
 * @returns Array of [name, value] tuples sorted by value descending
 */
export const getTopEmissionSources = (
  observations: GHGObservation[],
  topN: number = 3,
  groupingField: string = '@type'
): Array<[string, number]> => {
  const grouped = groupObservationsByField(observations, groupingField);
  const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  return entries.slice(0, topN);
};
