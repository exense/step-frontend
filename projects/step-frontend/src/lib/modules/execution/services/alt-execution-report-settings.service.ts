import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { GridEditableService, WidgetsPersistenceStateService } from '@exense/step-core';
import {
  ALT_EXECUTION_REPORT_DETAIL_KEYS,
  AltExecutionReportDetailKey,
  AltExecutionReportWidgetSettings,
  AltExecutionReportWidgetType,
} from '../shared/alt-execution-report-details';

@Injectable()
export class AltExecutionReportSettingsService {
  private _gridEditable = inject(GridEditableService);
  private _widgetsPersistence = inject(WidgetsPersistenceStateService);

  private readonly viewOverrides = signal<
    Partial<Record<AltExecutionReportWidgetType, AltExecutionReportWidgetSettings>>
  >({});

  readonly detailOptions = ALT_EXECUTION_REPORT_DETAIL_KEYS;

  details(widgetType: AltExecutionReportWidgetType): Signal<AltExecutionReportDetailKey[]> {
    return computed(() => this.getDetails(widgetType));
  }

  hasDetails(widgetType: AltExecutionReportWidgetType): Signal<boolean> {
    return computed(() => this.getDetails(widgetType).length > 0);
  }

  isDetailEnabled(widgetType: AltExecutionReportWidgetType, key: AltExecutionReportDetailKey): boolean {
    return this.getDetails(widgetType).includes(key);
  }

  updateDetail(widgetType: AltExecutionReportWidgetType, key: AltExecutionReportDetailKey, enabled: boolean): void {
    const current = new Set(this.getDetails(widgetType));
    if (enabled) {
      current.add(key);
    } else {
      current.delete(key);
    }

    const details = ALT_EXECUTION_REPORT_DETAIL_KEYS.filter((detailKey) => current.has(detailKey));
    const nextSettings = details.length ? ({ details } as AltExecutionReportWidgetSettings) : undefined;

    if (this._gridEditable.editMode()) {
      this._widgetsPersistence.updateWidgetSettings(widgetType, nextSettings);
      return;
    }

    this.viewOverrides.update((currentOverrides) => {
      const nextOverrides = { ...currentOverrides };
      if (!nextSettings) {
        delete nextOverrides[widgetType];
      } else {
        nextOverrides[widgetType] = nextSettings;
      }
      return nextOverrides;
    });
  }

  private getDetails(widgetType: AltExecutionReportWidgetType): AltExecutionReportDetailKey[] {
    const viewOverride = this.viewOverrides()[widgetType];
    const persistedSettings = this._widgetsPersistence.getWidgetSettings(widgetType) as
      | AltExecutionReportWidgetSettings
      | undefined;
    const details = this._gridEditable.editMode()
      ? (persistedSettings?.details ?? [])
      : (viewOverride?.details ?? persistedSettings?.details ?? []);
    return details.filter((detail): detail is AltExecutionReportDetailKey =>
      ALT_EXECUTION_REPORT_DETAIL_KEYS.includes(detail as AltExecutionReportDetailKey),
    );
  }
}
