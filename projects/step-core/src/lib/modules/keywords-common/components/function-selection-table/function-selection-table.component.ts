import { Component, inject, viewChild } from '@angular/core';
import {
  EntitiesSelectionModule,
  entitySelectionStateProvider,
} from '../../../entities-selection/entities-selection.module';
import { BaseEntitySelectionTableComponent } from '../../../entity/entity.module';
import { TableComponent, TableModule } from '../../../table/table.module';
import { AugmentedKeywordsService, Keyword } from '../../../../client/step-client-module';
import { DateFormat, StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-function-selection-table',
  templateUrl: './function-selection-table.component.html',
  styleUrls: ['./function-selection-table.component.scss'],
  providers: [...entitySelectionStateProvider<string, Keyword>('id')],
  imports: [TableModule, StepBasicsModule, EntitiesSelectionModule],
})
export class FunctionSelectionTableComponent extends BaseEntitySelectionTableComponent {
  protected tableRef = viewChild('tableRef', { read: TableComponent<Keyword> });
  protected _dataSource = inject(AugmentedKeywordsService).getKeywordSelectionTableDataSource();
  readonly DateFormat = DateFormat;
}
