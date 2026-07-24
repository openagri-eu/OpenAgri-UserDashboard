/**
 * Type definitions for GHG data structures
 */

export type EntityType = 'winery' | 'parcel';
export type DataType = 'observation' | 'activity';

/**
 * Source API types
 */
export type SourceAPI =
  | 'Observations'
  | 'FertilizationOperations'
  | 'CropProtectionOperations'
  | 'IrrigationOperations'
  | 'YieldPrediction'
  | 'CropGrowthStageObservations'
  | 'CropStressIndicatorObservations';

/**
 * Normalized GHG data item
 */
export interface NormalizedGHGData {
  '@type': string;
  '@id'?: string;
  title?: string;
  phenomenonTime?: string;
  timestamp?: string;
  rawValue: number; // The original numeric value (before emission factors)
  ghgValue: number; // The calculated GHG value (after emission factors)
  unit?: string;
  entityId: string; // Parcel/Winery ID
  entityType: EntityType;
  dataType: DataType;
  sourceAPI: SourceAPI;
  emissionFactor: number;
  originalData: any; // Keep reference to original object
}

/**
 * Entity GHG result
 */
export interface EntityGHGResult {
  entityId: string;
  entityName: string;
  entityType: EntityType;
  totalGHG: number;
  dataBySource: Record<SourceAPI, NormalizedGHGData[]>;
  sourceBreakdown: Record<SourceAPI, number>; // Total GHG per source
}

/**
 * Aggregated GHG results
 */
export interface AggregatedGHGResults {
  wineries: EntityGHGResult[];
  parcels: EntityGHGResult[];
  wineryTotal: number;
  parcelTotal: number;
  grandTotal: number;
  allNormalizedData: NormalizedGHGData[];
}
