import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ReportNode,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { CaseArtefact } from '../../types/case.artefact';

@Component({
  selector: 'step-case-report-details',
  templateUrl: './case-report-details.component.html',
  styleUrl: './case-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CaseReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<CaseArtefact>> {
  private _artefactInlineItems = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    if (!node?.resolvedArtefact?.value) {
      return undefined;
    }
    return this._artefactInlineItems.convert([['value', node.resolvedArtefact.value, 'log-in']]);
  });
}
