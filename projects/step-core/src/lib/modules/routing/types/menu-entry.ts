export interface MenuEntry {
  id: string;
  title: string;
  icon: string;
  weight?: number;
  parentId?: string;
  isCustom?: boolean;
  isBookmark?: boolean;

  isEnabledFct(): boolean;
}
