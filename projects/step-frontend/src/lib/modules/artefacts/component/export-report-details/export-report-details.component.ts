import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactService, BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
import { ExportArtefact } from '../../types/export.artefact';

@Component({
  selector: 'step-export-report-details',
  templateUrl: './export-report-details.component.html',
  styleUrl: './export-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<ExportArtefact>> {
  private _artefactService = inject(ArtefactService);

  protected readonly items = computed(() => {
    const node = this.node();
    let result: Record<string, unknown> = {};
    const artefact = node?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }

    result['value'] = this._artefactService.convertDynamicValue(artefact.value);
    result['file'] = this._artefactService.convertDynamicValue(artefact.file);

    const prefix = this._artefactService.convertDynamicValue(artefact.prefix);
    const filter = this._artefactService.convertDynamicValue(artefact.filter);

    if (artefact.prefix.dynamic || !!prefix) {
      result['prefix'] = prefix;
    }

    if (artefact.filter.dynamic || !!filter) {
      result['filter'] = filter;
    }

    return result;
  });
}
