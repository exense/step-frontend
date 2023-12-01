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

@NgModule({
  declarations: [AutomationPackageInfoComponent, AutomationPackageSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StepBasicsModule,
    StepMaterialModule,
    CustomRegistriesModule,
    TableModule,
    EntityModule,
  ],
  exports: [AutomationPackageInfoComponent, AutomationPackageSearchComponent],
})
export class AutomationPackageCommonModule {
  constructor(
    private _cellsRegistry: CustomCellRegistryService,
    private _searchCellsRegistry: CustomSearchCellRegistryService
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
