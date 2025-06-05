import { Component, inject, ViewChild } from '@angular/core';
import {
  AugmentedUserService,
  AutoDeselectStrategy,
  BaseEntitySelectionTableComponent,
  User,
  selectionCollectionProvider,
  SelectionCollector,
  TableComponent,
} from '@exense/step-core';

@Component({
  selector: 'step-user-selection',
  templateUrl: './user-selection.component.html',
  styleUrls: ['./user-selection.component.scss'],
  providers: [...selectionCollectionProvider<string, User>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
  standalone: false,
})
export class UserSelectionComponent extends BaseEntitySelectionTableComponent {
  protected _selectionCollector = inject<SelectionCollector<string, User>>(SelectionCollector);
  @ViewChild('tableRef', { read: TableComponent })
  protected _tableRef?: TableComponent<User>;
  readonly _dataSource = inject(AugmentedUserService).createSelectionDataSource();
}
