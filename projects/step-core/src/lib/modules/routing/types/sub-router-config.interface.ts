import { AccessPermissionGroup } from './access-permission';

export interface SubRouterConfig extends AccessPermissionGroup {
  label?: string;
  weight?: number;
  parentPath?: string;
}
