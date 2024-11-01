import { AccessPermissionGroup } from './access-permission';

export interface SubRouteData extends AccessPermissionGroup {
  path?: string;
  label?: string;
  weight?: number;
}
