export enum AccessPermissionCondition {
  OR,
  AND,
}

export interface AccessPermissionGroup {
  accessPermissionsCondition?: AccessPermissionCondition;
  accessPermissions?: AccessPermission[];
}

export type AccessPermission = string | AccessPermissionGroup;
