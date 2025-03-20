import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemUtilsService,
  ArtefactService,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { TestSetArtefact } from '../../types/test-set.artefact';

@Component({
  selector: 'step-test-set-report-details',
  templateUrl: './test-set-report-details.component.html',
  styleUrl: './test-set-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSetReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<TestSetArtefact>> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    return this._artefactInlineUtils.convert([['threads', artefact.threads, 'log-in']]);
  });
}
