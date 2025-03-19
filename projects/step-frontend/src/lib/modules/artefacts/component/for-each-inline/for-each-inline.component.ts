import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { ForEachArtefact } from '../../types/for-each.artefact';
import { DataSourceFieldsService } from '../../injectables/data-source-fields.service';
import { map, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-for-each-inline',
  templateUrl: './for-each-inline.component.html',
  styleUrl: './for-each-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForEachInlineComponent extends BaseInlineArtefactComponent<ForEachArtefact> {
  private _dataSourceFields = inject(DataSourceFieldsService);
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .asyncBuilder<ForEachArtefact>()
    .extractArtefactItemsAsync((artefact) => {
      if (!artefact?.dataSourceType || !artefact?.dataSource) {
        return of(undefined);
      }

      return this._dataSourceFields.createDataSourceFields(artefact.dataSourceType, artefact.dataSource).pipe(
        map((items) => [['threads', artefact.threads], ...items] as ArtefactInlineItemSource),
        map((items) => this._artefactInlineUtils.convert(items)),
      );
    });

  private items$ = toObservable(this.currentContext).pipe(switchMap((ctx) => this._itemsBuilder.build(ctx)));

  protected items = toSignal(this.items$);
}
