import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepMaterialModule } from '../step-material/step-material.module';
import { TableComponent } from './components/table/table.component';
import { SearchColDirective } from './directives/search-col.directive';
import { SearchCellDefDirective } from './directives/search-cell-def.directive';

@NgModule({
  imports: [CommonModule, StepMaterialModule],
  declarations: [TableComponent, SearchColDirective, SearchCellDefDirective],
  exports: [TableComponent, SearchColDirective, SearchCellDefDirective],
})
export class TableModule {}

export * from './components/table/table.component';
export * from './shared/search-value';
export * from './shared/table-remote-data-source';
export * from './shared/table-local-data-source';
export * from './shared/table-data-source';
export * from './services/api/table-rest.service';
export * from './services/table.search';
export * from './directives/search-col.directive';
export * from './directives/search-cell-def.directive';
