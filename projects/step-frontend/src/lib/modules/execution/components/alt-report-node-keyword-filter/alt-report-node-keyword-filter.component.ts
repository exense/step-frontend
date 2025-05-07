import { Component, computed, inject } from '@angular/core';
import { AltReportNodesStateService } from '../../services/alt-report-nodes-state.service';
import { ReportNodeType } from '../../../report-nodes/shared/report-node-type.enum';

@Component({
  selector: 'step-alt-report-node-keyword-filter',
  templateUrl: './alt-report-node-keyword-filter.component.html',
  styleUrl: './alt-report-node-keyword-filter.component.scss',
})
export class AltReportNodeKeywordFilterComponent {
  private _state = inject(AltReportNodesStateService);

  protected hasKeywordFilter = computed(() => {
    const reportNodeClass = this._state.reportNodeClassValue();
    return reportNodeClass === ReportNodeType.CALL_FUNCTION_REPORT_NODE;
  });

  protected clearKeywordsFilter(): void {
    this._state.reportNodeClassCtrl.setValue(undefined);
  }

  protected setKeywordsFilter(): void {
    this._state.reportNodeClassCtrl.setValue(ReportNodeType.CALL_FUNCTION_REPORT_NODE);
  }
}
