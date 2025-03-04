import { MenuEntry } from '@exense/step-core';

export type DisplayMenuEntry = Pick<MenuEntry, 'id' | 'title' | 'icon' | 'isCustom' | 'isActiveFct'> & {
  isBookmark?: boolean;
  hasChildren?: boolean;
  children?: DisplayMenuEntry[];
};
