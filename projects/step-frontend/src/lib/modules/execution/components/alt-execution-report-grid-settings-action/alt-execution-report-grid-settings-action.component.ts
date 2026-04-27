import { Component, computed, inject } from '@angular/core';
import { GridElementComponent } from '@exense/step-core';
import { AltExecutionReportWidgetType } from '../../shared/alt-execution-report-details';

@Component({
  selector: 'step-alt-execution-report-grid-settings-action',
  templateUrl: './alt-execution-report-grid-settings-action.component.html',
  standalone: false,
})
export class AltExecutionReportGridSettingsActionComponent {
  private readonly _gridElement = inject(GridElementComponent);

  protected readonly widgetType = computed<AltExecutionReportWidgetType | undefined>(() => {
    const widgetType = this._gridElement.widgetType();
    if (widgetType === 'executionTree' || widgetType === 'keywordsList') {
      return widgetType;
    }
    return undefined;
  });
}
