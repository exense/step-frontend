import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemUtilsService,
  ArtefactService,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { IfArtefact } from '../../types/if.artefact';

@Component({
  selector: 'step-if-report-details',
  templateUrl: './if-report-details.component.html',
  styleUrl: './if-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IfReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<IfArtefact>> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    return this._artefactInlineUtils.convert([['condition', artefact.condition, 'log-in']]);
  });
}
