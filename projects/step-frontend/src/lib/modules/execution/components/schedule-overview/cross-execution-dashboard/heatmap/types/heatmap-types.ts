import { StatusDistributionItem } from '../../../../status-distribution-tooltip/status-distribution-tooltip.component';

export interface HeatmapColumn {
  id: string;
  label?: string;
}

export interface HeatMapRow {
  label: string;
  cells: Record<string, HeatMapCell>;
}

export interface HeatMapCell {
  color: string;
  link?: string;
  timestamp: number;
  statuses: StatusDistributionItem[];
}

export interface HeatMapColor {
  hex: string;
  label: string;
}

export interface HeatmapData {
  columns: HeatmapColumn[];
  rows: HeatMapRow[];
}

export interface HeatmapDataResponse {
  truncated: boolean;
  data: HeatmapData;
}
