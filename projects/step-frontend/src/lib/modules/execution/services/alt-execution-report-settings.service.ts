import { computed, inject, Injectable, Signal, signal, untracked } from '@angular/core';
import { GridEditableService, WidgetsPersistenceStateService } from '@exense/step-core';
import {
  ALT_EXECUTION_REPORT_DETAIL_KEYS,
  AltExecutionReportDetailKey,
  AltExecutionReportWidgetSettings,
  AltExecutionReportWidgetType,
} from '../shared/alt-execution-report-details';

interface DetailsReadOptions {
  readonly tracked?: boolean;
  readonly editMode?: boolean;
}

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
    const editMode = untracked(() => this._gridEditable.editMode());
    const current = new Set(this.getDetails(widgetType, { tracked: false, editMode }));
    if (enabled) {
      current.add(key);
    } else {
      current.delete(key);
    }

    const details = ALT_EXECUTION_REPORT_DETAIL_KEYS.filter((detailKey) => current.has(detailKey));
    const nextSettings = details.length ? ({ details } as AltExecutionReportWidgetSettings) : undefined;

    if (editMode) {
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

  private getDetails(
    widgetType: AltExecutionReportWidgetType,
    { tracked = true, editMode }: DetailsReadOptions = {},
  ): AltExecutionReportDetailKey[] {
    const readDetails = (): AltExecutionReportDetailKey[] => {
      const isEditMode = editMode ?? this._gridEditable.editMode();
      const persistedSettings = this._widgetsPersistence.getWidgetSettings(widgetType) as
        | AltExecutionReportWidgetSettings
        | undefined;
      const viewOverride = isEditMode ? undefined : this.viewOverrides()[widgetType];
      const details = isEditMode
        ? (persistedSettings?.details ?? [])
        : (viewOverride?.details ?? persistedSettings?.details ?? []);
      return details.filter((detail): detail is AltExecutionReportDetailKey =>
        ALT_EXECUTION_REPORT_DETAIL_KEYS.includes(detail as AltExecutionReportDetailKey),
      );
    };

    return tracked ? readDetails() : untracked(readDetails);
  }
}
