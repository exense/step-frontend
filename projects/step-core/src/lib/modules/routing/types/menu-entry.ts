export interface MenuEntry {
  id: string;
  title: string;
  icon: string;
  weight?: number;
  parentId?: string;
  isCustom?: boolean;

  isEnabledFct(): boolean;
  isActiveFct?(url: string): boolean;
  isCleanupOnReload?: boolean;
}
