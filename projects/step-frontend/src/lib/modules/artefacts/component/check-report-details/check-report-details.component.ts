import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ReportNode,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { CheckArtefact } from '../../types/check.artefact';

@Component({
  selector: 'step-check-report-details',
  templateUrl: './check-report-details.component.html',
  styleUrl: './check-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CheckReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<CheckArtefact>> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    const artefact = node?.resolvedArtefact;
    if (!artefact?.expression) {
      return undefined;
    }
    return this._artefactInlineUtils.convert([['expression', artefact.expression, 'log-in']]);
  });
}
