export interface ConfigDto {
  authentication: boolean;
  debug: boolean;
  defaultUrl: string;
  demo: boolean;
  displayLegacyPerfDashboard: boolean;
  displayNewPerfDashboard: boolean;
  miscParams: { [key: string]: string };
  noLoginMask: boolean;
  roles: string[];
  title: string;
}
