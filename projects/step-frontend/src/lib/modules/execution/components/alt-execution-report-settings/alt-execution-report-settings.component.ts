import { Component, computed, inject, input } from '@angular/core';
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

  readonly widgetType = input.required<AltExecutionReportWidgetType>();

  protected readonly detailOptions = this._settings.detailOptions.map((key) => ({
    key,
    label: this.getLabel(key),
  }));

  protected readonly details = computed(() => this._settings.details(this.widgetType())());
  protected readonly hasDetails = computed(() => this.details().length > 0);
  protected readonly PopoverMode = PopoverMode;

  protected isChecked(key: AltExecutionReportDetailKey): boolean {
    return this._settings.isDetailEnabled(this.widgetType(), key);
  }

  protected onToggle(key: AltExecutionReportDetailKey, checked: boolean): void {
    this._settings.updateDetail(this.widgetType(), key, checked);
  }

  private getLabel(key: AltExecutionReportDetailKey): string {
    switch (key) {
      case 'attachmentPreview':
        return 'Attachment preview';
      case 'agentRouting':
        return 'Agent routing';
      case 'fullInputsOutputs':
        return 'Full Inputs / Outputs';
      case 'description':
        return 'Description';
    }
  }
}
