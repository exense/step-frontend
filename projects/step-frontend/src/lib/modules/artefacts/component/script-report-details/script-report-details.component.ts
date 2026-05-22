import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemUtilsService,
  ItemType,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { ScriptArtefact } from '../../types/script.artefact';

@Component({
  selector: 'step-script-report-details',
  templateUrl: './script-report-details.component.html',
  styleUrl: './script-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ScriptReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<ScriptArtefact>> {
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    if (!node?.resolvedArtefact) {
      return undefined;
    }

    return this._artefactInlineUtils.convert([
      { label: 'script', value: node.resolvedArtefact.script, itemType: ItemType.CONFIGURATION },
    ]);
  });
}
