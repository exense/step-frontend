export interface ReportNodeSummary {
  items: {
    [key: string]: number;
  };
  total: number;
  countForecast?: number;
}
