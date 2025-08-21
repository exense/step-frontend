import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StepBasicsModule } from '../basics/step-basics.module';
import { StepMaterialModule } from '../step-material/step-material.module';
import {
  CustomCellRegistryService,
  CustomRegistriesModule,
  CustomSearchCellRegistryService,
} from '../custom-registeries/custom-registries.module';
import { TableModule } from '../table/table.module';
import { EntityModule } from '../entity/entity.module';
import { AutomationPackageInfoComponent } from './components/automation-package-info/automation-package-info.component';
import { AutomationPackageSearchComponent } from './components/automation-package-search/automation-package-search.component';
import { AutomationPackageRefIconComponent } from './components/automation-package-ref-icon/automation-package-ref-icon.component';
import { AutomationPackageFilterPopoverComponent } from './components/automation-package-filter-popover/automation-package-filter-popover.component';
import { ENTITIES_SELECTION_EXPORTS } from '../entities-selection';
import { AutomationPackageFilterComponent } from './components/automation-package-filter/automation-package-filter.component';

@NgModule({
  declarations: [
    AutomationPackageInfoComponent,
    AutomationPackageSearchComponent,
    AutomationPackageRefIconComponent,
    AutomationPackageFilterPopoverComponent,
    AutomationPackageFilterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StepBasicsModule,
    StepMaterialModule,
    CustomRegistriesModule,
    TableModule,
    EntityModule,
    ENTITIES_SELECTION_EXPORTS,
  ],
  exports: [
    AutomationPackageInfoComponent,
    AutomationPackageSearchComponent,
    AutomationPackageRefIconComponent,
    AutomationPackageFilterComponent,
  ],
})
export class AutomationPackageCommonModule {
  constructor(
    private _cellsRegistry: CustomCellRegistryService,
    private _searchCellsRegistry: CustomSearchCellRegistryService,
  ) {
    this.registerCells();
    this.registerSearchCells();
  }

  private registerCells(): void {
    this._cellsRegistry.registerCell('automationPackageInfo', AutomationPackageInfoComponent);
  }

  private registerSearchCells(): void {
    this._searchCellsRegistry.registerSearchCell('automationPackageSearch', AutomationPackageSearchComponent);
  }
}

export * from './components/automation-package-info/automation-package-info.component';
export * from './components/automation-package-search/automation-package-search.component';
export * from './components/automation-package-ref-icon/automation-package-ref-icon.component';
export * from './components/automation-package-filter/automation-package-filter.component';
