import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ItemType,
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
      { label: 'value', value: artefact.value, itemType: ItemType.configuration },
      { label: 'file', value: artefact.file, itemType: ItemType.configuration },
    ];

    if (artefact.prefix?.value || artefact.prefix?.expression) {
      source.push({ label: 'prefix', value: artefact.prefix, itemType: ItemType.configuration });
    }

    if (artefact.filter?.value || artefact.filter?.expression) {
      source.push({ label: 'filter', value: artefact.filter, itemType: ItemType.configuration });
    }

    return this._artefactInlineItems.convert(source);
  });
}
