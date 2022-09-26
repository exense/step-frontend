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
import { CustomRegistriesModule } from '../custom-registeries/custom-registries.module';
import { CustomCellComponentsPipe } from './pipe/custom-cell-components.pipe';
import { AdditionalHeaderDirective } from './directives/additional-header.directive';
import { BulkOperationsComponent } from './components/bulk-operations/bulk-operations.component';
import { EntitiesSelectionModule } from '../entities-selection/entities-selection.module';
import { BulkOperationIconPipe } from './pipe/bulk-operation-icon.pipe';
import { AsyncOperationsModule } from '../async-operations/async-operations.module';
import { BulkOperationLabelPipe } from './pipe/bulk-operation-label.pipe';
import { CustomSearchCellComponentsPipe } from './pipe/custom-search-cell-components.pipe';
import { StepBasicsModule } from '../basics/step-basics.module';

@NgModule({
  imports: [
    CommonModule,
    StepMaterialModule,
    StepTableClientModule,
    EntitiesSelectionModule,
    CustomRegistriesModule,
    AsyncOperationsModule,
    StepBasicsModule,
  ],
  declarations: [
    TableComponent,
    SearchColDirective,
    SearchCellDefDirective,
    CustomColumnsComponent,
    CustomCellValuePipe,
    ColumnDirective,
    CustomCellComponentsPipe,
    AdditionalHeaderDirective,
    BulkOperationsComponent,
    BulkOperationIconPipe,
    BulkOperationLabelPipe,
    CustomSearchCellComponentsPipe,
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
export * from './services/table-search';
export * from './services/table-legacy-utils.service';
export * from './directives/search-col.directive';
export * from './directives/search-cell-def.directive';
export * from './services/custom-column-options';
export * from './directives/additional-header.directive';
export * from './components/bulk-operations/bulk-operations.component';
export * from './services/bulk-operations-invoke.service';
export * from './shared/bulk-operation.enum';
export * from './pipe/bulk-operation-label.pipe';
export * from './pipe/bulk-operation-icon.pipe';
export * from './shared/filter-condition';
export * from './services/filter-condition-factory.service';
