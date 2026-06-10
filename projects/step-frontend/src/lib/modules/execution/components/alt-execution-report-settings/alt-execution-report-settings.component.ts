import { Component, computed, inject, input, signal } from '@angular/core';
import { PopoverMode } from '@exense/step-core';
import { AltExecutionReportSettingsService } from '../../services/alt-execution-report-settings.service';
import { AltExecutionReportDetailKey, AltExecutionReportWidgetType } from '../../shared/alt-execution-report-details';

@Component({
  selector: 'step-alt-execution-report-settings',
  templateUrl: './alt-execution-report-settings.component.html',
  styleUrl: './alt-execution-report-settings.component.scss',
  standalone: false,
})
export class AltExecutionReportSettingsComponent {
  private _settings = inject(AltExecutionReportSettingsService);
  private toggleVersions = new Map<AltExecutionReportDetailKey, number>();

  readonly widgetType = input.required<AltExecutionReportWidgetType>();
  protected readonly pendingDetailOptions = signal<Partial<Record<AltExecutionReportDetailKey, boolean>>>({});

  private readonly details = computed(() => {
    const widgetType = this.widgetType();
    return this._settings.details(widgetType)();
  });

  protected readonly detailOptions = computed(() => {
    const details = this.details();
    const pendingDetailOptions = this.pendingDetailOptions();
    return this._settings.detailOptions.map((key) => ({
      key,
      label: this.getLabel(key),
      isChecked: pendingDetailOptions[key] ?? details.includes(key),
    }));
  });

  protected readonly hasDetails = computed(() => this.detailOptions().some((option) => option.isChecked));
  protected readonly PopoverMode = PopoverMode;

  protected onToggle(key: AltExecutionReportDetailKey, checked: boolean): void {
    const version = (this.toggleVersions.get(key) ?? 0) + 1;
    this.toggleVersions.set(key, version);
    this.pendingDetailOptions.update((pending) => ({ ...pending, [key]: checked }));

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (this.toggleVersions.get(key) !== version) {
          return;
        }
        this._settings.updateDetail(this.widgetType(), key, checked);
        this.pendingDetailOptions.update((pending) => {
          const { [key]: _, ...rest } = pending;
          return rest;
        });
      });
    });
  }

  private getLabel(key: AltExecutionReportDetailKey): string {
    switch (key) {
      case 'fullDescription':
        return 'Description';
      case 'fullInputsOutputs':
        return 'Full input / outputs';
      case 'agentRouting':
        return 'Routing';
      case 'attachmentPreview':
        return 'Attachment previews';
    }
  }
}
