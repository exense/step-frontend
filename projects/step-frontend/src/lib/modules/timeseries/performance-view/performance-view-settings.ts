export interface PerformanceViewSettings {
  contextId: string; // this must be unique across the application
  contextualFilters: { [key: string]: string };
  startTime: number;
  endTime: number;
}
