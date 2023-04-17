export interface ExportMeasurementsRequest {
  oqlFilter: string;
  format: MeasurementExportType;
}

export enum MeasurementExportType {
  CSV = 'CSV',
  JSON = 'JSON',
}
