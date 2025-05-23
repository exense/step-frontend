export interface DoughnutChartSettings {
  viewMode?: 'view' | 'print';
  totalValue?: string;
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
