import { Injectable } from '@angular/core';

export type AltExecutionDashboardWidgetType =
  | 'errorsSummary'
  | 'testCasesList'
  | 'testCasesSummary'
  | 'keywordsSummary'
  | 'executionTree'
  | 'keywordsList'
  | 'performanceChart'
  | 'errorsTable'
  | 'currentOperations'
  | `customPanel:${string}`;

export interface AltExecutionDashboardWidget {
  id: string;
  type: AltExecutionDashboardWidgetType;
  colSpan: number;
  rowSpan: number;
}

export interface AltExecutionDashboardLayout {
  id: string;
  name: string;
  protected: boolean;
  widgets: AltExecutionDashboardWidget[];
}

export interface AltExecutionDashboardState {
  version: number;
  activeLayoutId: string;
  layouts: AltExecutionDashboardLayout[];
}

const STORAGE_VERSION = 1;

@Injectable({
  providedIn: 'root',
})
export class AltExecutionDashboardLayoutService {
  buildStorageKey(userId: string, projectId: string): string {
    const safeUser = userId || 'anonymous';
    const safeProject = projectId || 'global';
    return `step.alt-execution.dashboard.${safeUser}.${safeProject}`;
  }

  load(storageKey: string, defaultLayouts: AltExecutionDashboardLayout[]): AltExecutionDashboardState {
    const defaultsState: AltExecutionDashboardState = {
      version: STORAGE_VERSION,
      activeLayoutId: defaultLayouts[0]?.id ?? 'default',
      layouts: defaultLayouts,
    };

    if (!storageKey) {
      return defaultsState;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return defaultsState;
      }
      const parsed = JSON.parse(raw) as AltExecutionDashboardState;
      if (!parsed || parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.layouts)) {
        return defaultsState;
      }

      const defaultsById = new Map(defaultLayouts.map((layout) => [layout.id, layout]));
      const mergedLayouts: AltExecutionDashboardLayout[] = [];

      parsed.layouts.forEach((layout) => {
        const defaultLayout = defaultsById.get(layout.id);
        if (defaultLayout?.protected) {
          mergedLayouts.push(defaultLayout);
        } else {
          mergedLayouts.push(layout);
        }
        defaultsById.delete(layout.id);
      });

      defaultsById.forEach((layout) => mergedLayouts.push(layout));

      return {
        version: STORAGE_VERSION,
        activeLayoutId: parsed.activeLayoutId || defaultsState.activeLayoutId,
        layouts: mergedLayouts,
      };
    } catch (_error) {
      return defaultsState;
    }
  }

  save(storageKey: string, state: AltExecutionDashboardState): void {
    if (!storageKey) {
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(state));
  }
}
