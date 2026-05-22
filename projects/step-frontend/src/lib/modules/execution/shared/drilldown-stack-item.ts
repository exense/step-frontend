import { DrilldownRootType } from './drilldown-root-type';
import { ReportNode } from '@exense/step-core';
import { AggregatedTreeNode } from './aggregated-tree-node';
import { Status } from '../../_common/shared/status.enum';

export const DRILL_DOWN_ROOT_ID = 'root';

export enum DrillDownStackItemType {
  ROOT = 'root',
  REPORT_NODE = 'report',
  AGGREGATED_REPORT_NODE = 'aggregated',
  PARTIAL_TREE = 'tree',
}

export type DrillDownStackItemTypeWORoot =
  | DrillDownStackItemType.REPORT_NODE
  | DrillDownStackItemType.AGGREGATED_REPORT_NODE
  | DrillDownStackItemType.PARTIAL_TREE;

export interface DrillDownRootStackItemConfig {
  type: DrillDownStackItemType.ROOT;
  rootType: DrilldownRootType;
  nodeId: string;
}

export interface DrillDownReportNodeStackItemConfig {
  type: DrillDownStackItemType.REPORT_NODE;
  nodeId: string;
}

export interface DrillDownReportNodePartialTreeStackItemConfig {
  type: DrillDownStackItemType.PARTIAL_TREE;
  nodeId: string;
}

export interface DrillDownAggregatedReportNodeStackItemConfig {
  type: DrillDownStackItemType.AGGREGATED_REPORT_NODE;
  nodeId: string;
  resolvedPartialPath?: string;
  searchStatus?: Status;
  searchStatusCount?: number;
}

export type DrillDownStackItemConfig =
  | DrillDownRootStackItemConfig
  | DrillDownReportNodeStackItemConfig
  | DrillDownAggregatedReportNodeStackItemConfig
  | DrillDownReportNodePartialTreeStackItemConfig;

export interface DrillDownRootStackItem extends DrillDownRootStackItemConfig {
  id: string;
}

export interface DrillDownReportNodeStackItem extends DrillDownReportNodeStackItemConfig {
  id: string;
  data: ReportNode;
}

export interface DrillDownReportNodePartialTreeStackItem extends DrillDownReportNodePartialTreeStackItemConfig {
  id: string;
  data: ReportNode;
}

export interface DrillDownAggregatedReportNodeStackItem extends DrillDownAggregatedReportNodeStackItemConfig {
  id: string;
  data: AggregatedTreeNode;
}

export type DrillDownStackItem =
  | DrillDownRootStackItem
  | DrillDownReportNodeStackItem
  | DrillDownReportNodePartialTreeStackItem
  | DrillDownAggregatedReportNodeStackItem;
