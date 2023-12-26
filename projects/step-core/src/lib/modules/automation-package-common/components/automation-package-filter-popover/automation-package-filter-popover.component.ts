import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { AugmentedAutomationPackagesService, AutomationPackage } from '../../../../client/step-client-module';
import {
  selectionCollectionProvider,
  AutoDeselectStrategy,
  SelectionCollector,
} from '../../../entities-selection/entities-selection.module';
import { tablePersistenceConfigProvider } from '../../../table/services/table-persistence-config.provider';

@Component({
  selector: 'step-automation-package-filter-popover',
  templateUrl: './automation-package-filter-popover.component.html',
  styleUrls: ['./automation-package-filter-popover.component.scss'],
  providers: [
    tablePersistenceConfigProvider('automationPackageFilter', {
      storePagination: false,
      storeSort: false,
      storeSearch: false,
    }),
    selectionCollectionProvider<string, AutomationPackage>('id', AutoDeselectStrategy.KEEP_SELECTION),
  ],
})
export class AutomationPackageFilterPopoverComponent implements AfterViewInit, OnDestroy {
  private _selectionCollector = inject<SelectionCollector<string, AutomationPackage>>(SelectionCollector);
  protected _dataSource = inject(AugmentedAutomationPackagesService).createDataSource();

  readonly selected$ = this._selectionCollector.selected$;

  private preselectedIds?: string[];
  private isInitialised = false;

  select(ids: string[]): void {
    if (!this.isInitialised) {
      this.preselectedIds = ids;
      return;
    }
    this._selectionCollector.selectById(...ids);
  }

  ngAfterViewInit(): void {
    this.isInitialised = true;
    if (this.preselectedIds) {
      this._selectionCollector.selectById(...this.preselectedIds!);
      this.preselectedIds = undefined;
    }
  }

  ngOnDestroy(): void {
    //TODO this should be fixed!!!
    this._selectionCollector.destroy();
  }
}
