import { Component, computed, inject } from '@angular/core';
import {
  ArtefactService,
  BaseReportDetailsComponent,
  JsonParserIconDictionaryConfig,
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
  private _artefactService = inject(ArtefactService);

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    let result: Record<string, unknown> | undefined = undefined;
    if (!artefact) {
      return result;
    }

    if (artefact.continueOnError) {
      const value = this._artefactService.convertDynamicValue(artefact.continueOnError);
      if (value) {
        result = result ?? {};
        result[''] = artefact.continueOnError.dynamic ? value : 'continue on error';
      }
    }

    if (artefact.pacing) {
      const value = this._artefactService.convertDynamicValue(artefact.pacing);
      if (value) {
        result = result ?? {};
        result['pacing'] = value;
      }
    }

    return result;
  });

  protected readonly itemIcons: JsonParserIconDictionaryConfig = [
    { key: '', icon: 'alert-circle', tooltip: 'Continue sequence execution on errors in child elements', levels: 0 },
  ];
}
