import { AfterViewInit, Component, EventEmitter, inject } from '@angular/core';
import { AugmentedAutomationPackagesService, AutomationPackage } from '../../../../client/step-client-module';
import {
  selectionCollectionProvider,
  AutoDeselectStrategy,
  SelectionCollector,
} from '../../../entities-selection/entities-selection.module';
import { tablePersistenceConfigProvider, tableColumnsConfigProvider } from '../../../table/table.module';

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
    ...selectionCollectionProvider<string, AutomationPackage>('id', AutoDeselectStrategy.KEEP_SELECTION),
  ],
  standalone: false,
})
export class AutomationPackageFilterPopoverComponent implements AfterViewInit {
  private _selectionCollector = inject<SelectionCollector<string, AutomationPackage>>(SelectionCollector);
  protected _dataSource = inject(AugmentedAutomationPackagesService).createDataSource();

  readonly selected$ = this._selectionCollector.selected$;

  readonly cleared = new EventEmitter<void>();

  private preselectedIds?: string[];
  private isInitialised = false;

  select(ids: string[]): void {
    if (!this.isInitialised) {
      this.preselectedIds = ids;
      return;
    }
    this._selectionCollector.selectById(...ids);
  }

  clearSelection() {
    this._selectionCollector.clear();
    this.cleared.emit();
  }

  ngAfterViewInit(): void {
    this.isInitialised = true;
    if (this.preselectedIds) {
      this._selectionCollector.selectById(...this.preselectedIds!);
      this.preselectedIds = undefined;
    }
  }
}
