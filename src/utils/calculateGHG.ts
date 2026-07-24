import { getEmissionFactor, isActivity } from './emissionFactors';
import {
  NormalizedGHGData,
  EntityGHGResult,
  AggregatedGHGResults,
  EntityType,
  SourceAPI,
} from '@/types/GHGData';

/**
 * Represents a GHG observation data structure
 */
export interface GHGObservation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * Extract numeric value from either observation or activity structure
 * @param data - Raw data object (observation or activity)
 * @returns Numeric value extracted from appropriate field
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractRawValue = (data: any): number => {
  if (isActivity(data)) {
    // Activities: hasAppliedAmount.numericValue
    return Number(data.hasAppliedAmount?.numericValue ?? 0) || 0;
  } else {
    // Observations: hasResult.hasValue
    return Number(data.hasResult?.hasValue ?? 0) || 0;
  }
};

/**
 * Normalize a single data item (observation or activity) to standard format
 * @param data - Raw data object
 * @param entityId - ID of the entity (parcel/winery)
 * @param entityType - Type of entity ('winery' | 'parcel')
 * @param sourceAPI - Source API endpoint
 * @returns Normalized GHG data item
 */
export const normalizeGHGDataItem = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  entityId: string,
  entityType: EntityType,
  sourceAPI: SourceAPI
): NormalizedGHGData => {
  const type = data['@type'] || 'Unknown';
  const rawValue = extractRawValue(data);
  const emissionFactor = getEmissionFactor(type);
  const ghgValue = rawValue * emissionFactor;

  return {
    '@type': type,
    '@id': data['@id'],
    title: data.title || data.name,
    phenomenonTime: data.phenomenonTime || data.timestamp,
    timestamp: data.timestamp || data.phenomenonTime,
    rawValue,
    ghgValue,
    unit: data.hasAppliedAmount?.unit || data.hasResult?.unit,
    entityId,
    entityType,
    dataType: isActivity(data) ? 'activity' : 'observation',
    sourceAPI,
    emissionFactor,
    originalData: data,
  };
};

/**
 * Normalize array of raw data items
 * @param dataItems - Array of raw data objects
 * @param entityId - ID of the entity
 * @param entityType - Type of entity
 * @param sourceAPI - Source API endpoint
 * @returns Array of normalized GHG data
 */
export const normalizeGHGDataArray = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataItems: any[],
  entityId: string,
  entityType: EntityType,
  sourceAPI: SourceAPI
): NormalizedGHGData[] => {
  if (!Array.isArray(dataItems)) {
    return [];
  }

  return dataItems.map((item) =>
    normalizeGHGDataItem(item, entityId, entityType, sourceAPI)
  );
};

/**
 * Calculate total GHG from normalized data with emission factors applied
 * @param normalizedData - Array of normalized GHG data items
 * @returns Total GHG emissions in kg CO₂e
 */
export const calculateGHGWithEmissionFactors = (
  normalizedData: NormalizedGHGData[]
): number => {
  if (!Array.isArray(normalizedData) || normalizedData.length === 0) {
    return 0;
  }

  return normalizedData.reduce((total, item) => total + item.ghgValue, 0);
};

/**
 * Aggregate GHG data by entity
 * @param normalizedData - Array of all normalized GHG data
 * @param entityNames - Map of entity IDs to names
 * @returns Aggregated results grouped by entity type
 */
export const aggregateGHGByEntity = (
  normalizedData: NormalizedGHGData[],
  entityNames: Record<string, string>
): AggregatedGHGResults => {
  const wineryResults: EntityGHGResult[] = [];
  const parcelResults: EntityGHGResult[] = [];

  // Group by entity
  const byEntity = new Map<string, NormalizedGHGData[]>();
  normalizedData.forEach((item) => {
    const existing = byEntity.get(item.entityId) || [];
    existing.push(item);
    byEntity.set(item.entityId, existing);
  });

  // Process each entity
  byEntity.forEach((entityData, entityId) => {
    const entityType = entityData[0]?.entityType || 'parcel';
    const entityName = entityNames[entityId] || entityId;

    // Group by source API
    const dataBySource: Record<string, NormalizedGHGData[]> = {};
    const sourceBreakdown: Record<string, number> = {};

    entityData.forEach((item) => {
      const source = item.sourceAPI;
      if (!dataBySource[source]) {
        dataBySource[source] = [];
        sourceBreakdown[source] = 0;
      }
      dataBySource[source].push(item);
      sourceBreakdown[source] += item.ghgValue;
    });

    const totalGHG = calculateGHGWithEmissionFactors(entityData);

    const result: EntityGHGResult = {
      entityId,
      entityName,
      entityType,
      totalGHG,
      dataBySource: dataBySource as Record<SourceAPI, NormalizedGHGData[]>,
      sourceBreakdown: sourceBreakdown as Record<SourceAPI, number>,
    };

    if (entityType === 'winery') {
      wineryResults.push(result);
    } else {
      parcelResults.push(result);
    }
  });

  // Calculate totals
  const wineryTotal = wineryResults.reduce((sum, r) => sum + r.totalGHG, 0);
  const parcelTotal = parcelResults.reduce((sum, r) => sum + r.totalGHG, 0);
  const grandTotal = wineryTotal + parcelTotal;

  return {
    wineries: wineryResults,
    parcels: parcelResults,
    wineryTotal,
    parcelTotal,
    grandTotal,
    allNormalizedData: normalizedData,
  };
};
