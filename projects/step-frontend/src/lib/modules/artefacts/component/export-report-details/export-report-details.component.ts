import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  ArtefactService,
  BaseReportDetailsComponent,
  ReportNodeWithArtefact,
} from '@exense/step-core';
import { ExportArtefact } from '../../types/export.artefact';

@Component({
  selector: 'step-export-report-details',
  templateUrl: './export-report-details.component.html',
  styleUrl: './export-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ExportReportDetailsComponent extends BaseReportDetailsComponent<ReportNodeWithArtefact<ExportArtefact>> {
  private _artefactInlineItems = inject(ArtefactInlineItemUtilsService);

  protected readonly items = computed(() => {
    const node = this.node();
    let result: Record<string, unknown> = {};
    const artefact = node?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }

    const source: ArtefactInlineItemSource = [
      ['value', artefact.value, 'log-in'],
      ['file', artefact.file, 'log-in'],
    ];

    if (artefact.prefix?.value || artefact.prefix?.expression) {
      source.push(['prefix', artefact.prefix, 'log-in']);
    }

    if (artefact.filter?.value || artefact.filter?.expression) {
      source.push(['filter', artefact.filter, 'log-in']);
    }

    return this._artefactInlineItems.convert(source);
  });
}
