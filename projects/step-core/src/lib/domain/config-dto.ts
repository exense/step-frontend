export interface ConfigDto {
  authentication: boolean;
  debug: boolean;
  defaultUrl: string;
  miscParams: { [key: string]: string };
  noLoginMask: boolean;
  roles: string[];
  title: string;
  authenticatorName: string;
}
