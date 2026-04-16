import { TreeNodePieChartSlice } from '../execution-piechart/aggregated-tree-node-statuses-piechart.component';

export interface HistoryNodeItem {
  statusSlices: TreeNodePieChartSlice[];
  timestamp?: number;
  tooltipLinkLabel?: string;
  link?: string;
  tooltipLink?: string;
}
