import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactService, BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
import { TestSetArtefact } from '../../types/test-set.artefact';

@Component({
  selector: 'step-test-set-report-nodes',
  templateUrl: './test-set-report-nodes.component.html',
  styleUrl: './test-set-report-nodes.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSetReportNodesComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<TestSetArtefact>> {
  private _artefactService = inject(ArtefactService);

  protected readonly items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    return {
      threads: this._artefactService.convertDynamicValue(artefact.threads),
    };
  });
}
