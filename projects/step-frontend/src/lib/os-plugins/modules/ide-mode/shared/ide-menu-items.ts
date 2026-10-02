import {MenuEntry} from '@exense/step-core';

const ideMenuItem = (item: Omit<MenuEntry, 'isVisibleFunction' | 'isEnabledFunction'>): MenuEntry => ({
  ...item,
  isVisibleFunction: () => true,
  isEnabledFunction: () => true,
});

export const IDE_MENU_ITEMS: MenuEntry[] = [
  ideMenuItem({ id: 'automation-root', title: 'Design', icon: 'edit', weight: 10 }),
  ideMenuItem({
    id: 'functions',
    title: 'Keywords',
    icon: 'keyword',
    weight: 10,
    parentId: 'automation-root',
  }),
  ideMenuItem({
    id: 'plans',
    title: 'Plans',
    icon: 'plan',
    weight: 20,
    parentId: 'automation-root',
  }),
  ideMenuItem({
    id: 'parameters',
    title: 'Parameters',
    icon: 'list',
    weight: 30,
    parentId: 'automation-root',
  }),
  ideMenuItem({
    id: 'scheduler',
    title: 'Schedules',
    icon: 'clock',
    weight: 40,
    parentId: 'automation-root',
  }),
  ideMenuItem({ id: 'execute-root', title: 'Reporting', icon: 'file-check-03', weight: 20 }),
  ideMenuItem({
    id: 'executions',
    title: 'Executions',
    icon: 'rocket',
    weight: 10,
    parentId: 'execute-root',
  }),
];
