import { Component, inject, input } from '@angular/core';
import { AugmentedControllerService, ReportNode } from '@exense/step-core';
import { AltReportNodeDetailsStateService } from '../../services/alt-report-node-details-state.service';
import { ExecutionDrilldownLeafPanel } from '../../services/execution-drilldown-state.service';
import { catchError, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-execution-drilldown-node-details-panel',
  templateUrl: './execution-drilldown-node-details-panel.component.html',
  standalone: false,
})
export class ExecutionDrilldownNodeDetailsPanelComponent {
  private readonly _controllerService = inject(AugmentedControllerService);
  private readonly _reportNodeDetailsState = inject(AltReportNodeDetailsStateService);

  readonly panel = input.required<ExecutionDrilldownLeafPanel>();

  private readonly reportNode$ = toObservable(this.panel).pipe(
    switchMap((panel) => {
      const reportNodeId = panel.reportNodeId;
      if (!reportNodeId) {
        return of(undefined);
      }

      const reportNode = this._reportNodeDetailsState.getReportNode(reportNodeId);
      if (reportNode) {
        return of(reportNode);
      }

      return this._controllerService.getReportNode(reportNodeId).pipe(catchError(() => of(undefined)));
    }),
  );

  protected readonly reportNode = toSignal<ReportNode | undefined>(this.reportNode$, { initialValue: undefined });
}
