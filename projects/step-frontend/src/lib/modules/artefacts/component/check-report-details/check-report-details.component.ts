import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseReportDetailsComponent, ReportNode, ReportNodeWithArtefact } from '@exense/step-core';
import { CheckArtefact } from '../../types/check.artefact';

@Component({
  selector: 'step-check-report-details',
  templateUrl: './check-report-details.component.html',
  styleUrl: './check-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<CheckArtefact>> {
  protected readonly items = computed(() => {
    const node = this.node();
    let result: Record<string, unknown> | undefined = undefined;
    const artefact = node?.resolvedArtefact;
    if (!artefact?.expression) {
      return result;
    }
    result = {
      '': artefact.expression.dynamic ? artefact.expression.expression : artefact.expression.value,
    };
    return result;
  });
}
