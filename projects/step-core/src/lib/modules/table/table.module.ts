import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepMaterialModule } from '../step-material/step-material.module';
import { TableComponent } from './components/table/table.component';
import { SearchColDirective } from './directives/search-col.directive';

@NgModule({
  imports: [CommonModule, StepMaterialModule],
  declarations: [TableComponent, SearchColDirective],
  exports: [TableComponent, SearchColDirective],
})
export class TableModule {}

export * from './components/table/table.component';
export * from './shared/table-remote-data-source';
export * from './shared/table-data-source';
export * from './services/api/table-rest.service';
export * from './directives/search-col.directive';
