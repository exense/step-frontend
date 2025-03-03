import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { ExportArtefact } from '../../types/export.artefact';

@Component({
  selector: 'step-export-inline',
  templateUrl: './export-inline.component.html',
  styleUrl: './export-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportInlineComponent extends BaseInlineArtefactComponent<ExportArtefact> {
  private _artefactInlineItemUtils = inject(ArtefactInlineItemUtilsService);
  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<ExportArtefact>()
    .extractArtefactItems((artefact, isResolved) => {
      if (!artefact) {
        return undefined;
      }
      const itemsSource: ArtefactInlineItemSource = [
        [undefined, artefact.value],
        [undefined, artefact.file],
      ];

      if (!!artefact.prefix?.dynamic || !!artefact.prefix?.value) {
        itemsSource.push(['Prefix', artefact.prefix]);
      }

      if (!!artefact.filter?.dynamic || !!artefact.filter?.value) {
        itemsSource.push(['Filter', artefact.filter]);
      }

      return this._artefactInlineItemUtils.convert(itemsSource, isResolved);
    });

  protected readonly items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
