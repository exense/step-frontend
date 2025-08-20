import { AfterViewInit, Component, EventEmitter, inject } from '@angular/core';
import { AugmentedAutomationPackagesService, AutomationPackage } from '../../../../client/step-client-module';
import {
  entitySelectionStateProvider,
  EntitySelectionStateUpdatable,
} from '../../../entities-selection/entities-selection.module';
import {
  tablePersistenceConfigProvider,
  tableColumnsConfigProvider,
  TablePersistenceStateService,
} from '../../../table/table.module';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'step-automation-package-filter-popover',
  templateUrl: './automation-package-filter-popover.component.html',
  styleUrls: ['./automation-package-filter-popover.component.scss'],
  providers: [
    tableColumnsConfigProvider(null),
    tablePersistenceConfigProvider('automationPackageFilter', {
      storePagination: false,
      storeSort: false,
      storeSearch: false,
    }),
    TablePersistenceStateService,
    ...entitySelectionStateProvider<string, AutomationPackage>('id'),
  ],
  standalone: false,
})
export class AutomationPackageFilterPopoverComponent implements AfterViewInit {
  private _selectionState =
    inject<EntitySelectionStateUpdatable<string, AutomationPackage>>(EntitySelectionStateUpdatable);

  protected _dataSource = inject(AugmentedAutomationPackagesService).createDataSource();

  readonly selected$ = toObservable(this._selectionState.selectedKeys).pipe(map((selected) => Array.from(selected)));

  readonly cleared = new EventEmitter<void>();

  private preselectedIds?: string[];
  private isInitialised = false;

  ngAfterViewInit(): void {
    this.isInitialised = true;
    if (this.preselectedIds) {
      this._selectionState.updateSelection({ keys: this.preselectedIds });
      this.preselectedIds = undefined;
    }
  }

  select(ids: string[]): void {
    if (!this.isInitialised) {
      this.preselectedIds = ids;
      return;
    }
    this._selectionState.updateSelection({ keys: ids });
  }

  protected clearSelection(): void {
    this._selectionState.updateSelection({ keys: [] });
    setTimeout(() => {
      this.cleared.emit();
    }, 200);
  }
}
