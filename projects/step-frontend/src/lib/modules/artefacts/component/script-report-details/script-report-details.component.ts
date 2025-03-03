import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
import { ScriptArtefact } from '../../types/script.artefact';

@Component({
  selector: 'step-script-report-details',
  templateUrl: './script-report-details.component.html',
  styleUrl: './script-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScriptReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<ScriptArtefact>> {
  protected readonly items = computed(() => {
    const node = this.node();
    if (!node?.resolvedArtefact) {
      return undefined;
    }

    const result: Record<string, unknown> = {
      '': node.resolvedArtefact.script,
    };

    return result;
  });
}
