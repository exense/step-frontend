import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactInlineItemUtilsService, BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
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
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    if (!node?.resolvedArtefact) {
      return undefined;
    }

    return this._artefactInlineUtils.convert([['script', node.resolvedArtefact.script, 'log-in']]);
  });
}
