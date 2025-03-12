import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemSource,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { DataSetArtefact } from '../../types/data-set.artefact';
import { DataSourceFieldsService } from '../../injectables/data-source-fields.service';
import { map, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-data-set-inline',
  templateUrl: './data-set-inline.component.html',
  styleUrl: './data-set-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSetInlineComponent extends BaseInlineArtefactComponent<DataSetArtefact> {
  private _dataSourceFields = inject(DataSourceFieldsService);
  private _artefactInlineUtils = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .asyncBuilder<DataSetArtefact>()
    .extractArtefactItemsAsync((artefact) => {
      if (!artefact?.dataSourceType || !artefact?.dataSource) {
        return of(undefined);
      }

      return this._dataSourceFields.createDataSourceFields(artefact.dataSourceType, artefact.dataSource).pipe(
        map((items) => [...items, ['for write', artefact?.dataSource?.forWrite]] as ArtefactInlineItemSource),
        map((items) => this._artefactInlineUtils.convert(items)),
      );
    });

  private items$ = toObservable(this.currentContext).pipe(switchMap((ctx) => this._itemsBuilder.build(ctx)));

  protected items = toSignal(this.items$);
}
