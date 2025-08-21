import { Component, inject, viewChild } from '@angular/core';
import {
  AugmentedUserService,
  BaseEntitySelectionTableComponent,
  User,
  TableComponent,
  Plan,
  entitySelectionStateProvider,
} from '@exense/step-core';

@Component({
  selector: 'step-user-selection',
  templateUrl: './user-selection.component.html',
  styleUrls: ['./user-selection.component.scss'],
  providers: [...entitySelectionStateProvider<string, User>('id')],
  standalone: false,
})
export class UserSelectionComponent extends BaseEntitySelectionTableComponent {
  protected tableRef = viewChild('tableRef', { read: TableComponent<Plan> });
  protected readonly _dataSource = inject(AugmentedUserService).createSelectionDataSource();
}
