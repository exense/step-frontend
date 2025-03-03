import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseReportDetailsComponent, ReportNode } from '@exense/step-core';
import { CaseArtefact } from '../../types/case.artefact';

@Component({
  selector: 'step-case-report-details',
  templateUrl: './case-report-details.component.html',
  styleUrl: './case-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseReportDetailsComponent extends BaseReportDetailsComponent<ReportNode> {
  protected readonly items = computed(() => {
    const node = this.node();
    let result: Record<string, unknown> | undefined = undefined;
    const artefact = node?.resolvedArtefact as CaseArtefact | undefined;
    if (!artefact?.value) {
      return result;
    }
    result = {
      '': artefact.value.dynamic ? artefact.value.expression : artefact.value.value,
    };
    return result;
  });
}
