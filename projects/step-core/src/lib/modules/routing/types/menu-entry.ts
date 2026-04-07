export interface MenuEntry {
  id: string;
  title: string;
  icon: string;
  weight?: number;
  parentId?: string;
  isCustom?: boolean;

  isVisibleFunction?(): boolean;
  isEnabledFunction(): boolean;
  isActiveFunction?(url: string): boolean;
  isCleanupOnReload?: boolean;
}
