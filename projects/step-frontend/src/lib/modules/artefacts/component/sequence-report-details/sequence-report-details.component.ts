import { Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { SequenceArtefact } from '../../types/sequence.artefact';

@Component({
  selector: 'step-sequence-report-details',
  templateUrl: './sequence-report-details.component.html',
  styleUrl: './sequence-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
})
export class SequenceReportDetailsComponent extends BaseReportDetailsComponent<
  ReportNodeWithArtefact<SequenceArtefact>
> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }

    return this._artefactInlineUtils.convert([
      ['continue on error', artefact.continueOnError, 'log-in'],
      ['pacing', artefact.pacing, 'log-in'],
    ]);
  });
}
