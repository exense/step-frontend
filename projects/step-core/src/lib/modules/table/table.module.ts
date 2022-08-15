import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepMaterialModule } from '../step-material/step-material.module';
import { TableComponent } from './components/table/table.component';
import { SearchColDirective } from './directives/search-col.directive';
import { SearchCellDefDirective } from './directives/search-cell-def.directive';
import { StepTableClientModule } from '../../client/table/step-table-client.module';
import { CustomColumnsComponent } from './components/custom-columns/custom-columns.component';
import { CustomCellValuePipe } from './pipe/custom-cell-value.pipe';
import { ColumnDirective } from './directives/column.directive';
import { AdditionalHeaderDirective } from './directives/additional-header.directive';
import { BulkOperationsComponent } from './components/bulk-operations/bulk-operations.component';
import { EntitiesSelectionModule } from '../entities-selection/entities-selection.module';
import { BulkOperationIconPipe } from './pipe/bulk-operation-icon.pipe';

@NgModule({
  imports: [CommonModule, StepMaterialModule, StepTableClientModule, EntitiesSelectionModule],
  declarations: [
    TableComponent,
    SearchColDirective,
    SearchCellDefDirective,
    CustomColumnsComponent,
    CustomCellValuePipe,
    ColumnDirective,
    AdditionalHeaderDirective,
    BulkOperationsComponent,
    BulkOperationIconPipe,
  ],
  exports: [
    TableComponent,
    SearchColDirective,
    SearchCellDefDirective,
    CustomColumnsComponent,
    ColumnDirective,
    AdditionalHeaderDirective,
    BulkOperationsComponent,
  ],
})
export class TableModule {}

export * from './components/table/table.component';
export * from './components/custom-columns/custom-columns.component';
export * from './directives/column.directive';
export * from './shared/search-value';
export * from './shared/table-remote-data-source';
export * from './shared/table-local-data-source';
export * from './shared/table-data-source';
export * from './services/table.search';
export * from './directives/search-col.directive';
export * from './directives/search-cell-def.directive';
export * from './directives/additional-header.directive';
export * from './components/bulk-operations/bulk-operations.component';
export * from './services/bulk-operations-invoke.service';
export * from './shared/bulk-operation.enum';
