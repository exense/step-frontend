import { ViewMode } from '../../../execution/shared/view-mode';

export interface DoughnutChartSettings {
  viewMode?: ViewMode;
  total?: number;
  items: DoughnutChartItem[];
}

export interface DoughnutChartItem {
  label: string;
  value: number;
  background: string;
}

export interface ChartItemClickEvent {
  item: DoughnutChartItem;
  shiftKey?: boolean;
  ctrlKey?: boolean;
}
