import { Component, inject, ViewChild } from '@angular/core';
import {
  AutoDeselectStrategy,
  selectionCollectionProvider,
  SelectionCollector,
} from '../../../entities-selection/entities-selection.module';
import { BaseEntitySelectionTableComponent } from '../../../entity/entity.module';
import { TableComponent } from '../../../table/table.module';
import { AugmentedKeywordsService } from '../../../../client/step-client-module';
import { DateFormat } from '../../../../shared';

@Component({
  selector: 'step-function-selection-table',
  templateUrl: './function-selection-table.component.html',
  styleUrls: ['./function-selection-table.component.scss'],
  providers: [selectionCollectionProvider<string, Function>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
})
export class FunctionSelectionTableComponent extends BaseEntitySelectionTableComponent {
  protected _selectionCollector = inject<SelectionCollector<string, Function>>(SelectionCollector);

  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<Function>;
  protected dataSource = inject(AugmentedKeywordsService).getKeywordSelectionTableDataSource();
  readonly DateFormat = DateFormat;
}
