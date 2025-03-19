import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactInlineItemUtilsService, BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
import { SwitchArtefact } from '../../types/switch.artefact';

@Component({
  selector: 'step-switch-report-details',
  templateUrl: './switch-report-details.component.html',
  styleUrl: './switch-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<SwitchArtefact>> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    return this._artefactInlineUtils.convert([['expression', artefact.expression, 'log-in']]);
  });
}
