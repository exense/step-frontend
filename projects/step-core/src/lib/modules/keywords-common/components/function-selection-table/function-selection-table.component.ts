import { Component, inject, ViewChild } from '@angular/core';
import {
  AutoDeselectStrategy,
  selectionCollectionProvider,
  SelectionCollector,
} from '../../../entities-selection/entities-selection.module';
import { BaseEntitySelectionTableComponent } from '../../../entity/entity.module';
import { TableComponent } from '../../../table/table.module';
import { AugmentedKeywordsService, Keyword } from '../../../../client/step-client-module';
import { DateFormat } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-function-selection-table',
  templateUrl: './function-selection-table.component.html',
  styleUrls: ['./function-selection-table.component.scss'],
  providers: [...selectionCollectionProvider<string, Keyword>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
  standalone: false,
})
export class FunctionSelectionTableComponent extends BaseEntitySelectionTableComponent {
  protected _selectionCollector = inject<SelectionCollector<string, Keyword>>(SelectionCollector);

  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<Keyword>;
  protected dataSource = inject(AugmentedKeywordsService).getKeywordSelectionTableDataSource();
  readonly DateFormat = DateFormat;
}
