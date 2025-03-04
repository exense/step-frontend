import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactService, BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
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
  private _artefactService = inject(ArtefactService);

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    const result: Record<string, unknown> = {
      _hidden_expression: this._artefactService.convertDynamicValue(artefact.expression),
    };
    return result;
  });
}
