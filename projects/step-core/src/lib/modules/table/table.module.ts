import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { StepMaterialModule } from '../step-material/step-material.module';
import { TableComponent } from './components/table/table.component';
import { SearchColDirective } from './directives/search-col.directive';
import { SearchCellDefDirective } from './directives/search-cell-def.directive';
import {
  StepTableClientModule,
  TableRemoteDataSourceFactoryService,
} from '../../client/table/step-table-client.module';
import { CustomColumnsComponent } from './components/custom-columns/custom-columns.component';
import { CustomCellValuePipe } from './pipe/custom-cell-value.pipe';
import { ColumnDirective } from './directives/column.directive';
import {
  CustomRegistriesModule,
  CustomSearchCellRegistryService,
} from '../custom-registeries/custom-registries.module';
import { CustomCellComponentsPipe } from './pipe/custom-cell-components.pipe';
import { AdditionalHeaderDirective } from './directives/additional-header.directive';
import { BulkOperationsComponent } from './components/bulk-operations/bulk-operations.component';
import { BulkOperationPerformStrategy, EntitiesSelectionModule } from '../entities-selection/entities-selection.module';
import { AsyncOperationsModule } from '../async-operations/async-operations.module';
import { CustomSearchCellComponentsPipe } from './pipe/custom-search-cell-components.pipe';
import { StepBasicsModule } from '../basics/step-basics.module';
import { SearchColMetaDirective } from './directives/search-col-meta.directive';
import { FilterConnectDirective } from './directives/filter-connect.directive';
import { CustomSearchDropdownComponent } from './components/custom-search-dropdown/custom-search-dropdown.component';
import { CustomSearchCheckboxComponent } from './components/custom-search-dropdown/custom-search-checkbox.component';
import { Input as ColInput } from '../../client/generated';
import { TableRemoteDataSourceFactoryImplService } from './services/table-remote-data-source-factory-impl.service';
import { BulkOperationPerformStrategyImplService } from './services/bulk-operation-perform-strategy-impl.service';
import { HighlightTableRowDirective } from './directives/highlight-table-row.directive';
import { DatePickerModule } from '../date-picker/date-picker.module';
import { RangeFilterComponent } from './components/range-filter/range-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { TableNavigatorQueryParamsCleanupService } from './services/table-navigator-query-params-cleanup.service';
import { NAVIGATOR_QUERY_PARAMS_CLEANUP } from '../routing';
import { HasRightPipe } from '../auth';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { EDITABLE_LABELS_EXPORTS } from '../editable-labels';

@NgModule({
  imports: [
    CommonModule,
    StepMaterialModule,
    StepTableClientModule,
    EntitiesSelectionModule,
    CustomRegistriesModule,
    AsyncOperationsModule,
    EDITABLE_LABELS_EXPORTS,
    StepBasicsModule,
    DatePickerModule,
    HasRightPipe,
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
    CustomSearchCellComponentsPipe,
    SearchColMetaDirective,
    FilterConnectDirective,
    CustomSearchDropdownComponent,
    CustomSearchCheckboxComponent,
    HighlightTableRowDirective,
    RangeFilterComponent,
    DateFilterComponent,
    PaginatorComponent,
  ],
  exports: [
    TableComponent,
    SearchColDirective,
    SearchCellDefDirective,
    CustomColumnsComponent,
    ColumnDirective,
    AdditionalHeaderDirective,
    BulkOperationsComponent,
    FilterConnectDirective,
    CustomSearchDropdownComponent,
    CustomSearchCheckboxComponent,
    HighlightTableRowDirective,
    RangeFilterComponent,
    DateFilterComponent,
    PaginatorComponent,
  ],
  providers: [
    TitleCasePipe,
    {
      provide: TableRemoteDataSourceFactoryService,
      useExisting: TableRemoteDataSourceFactoryImplService,
    },
    {
      provide: BulkOperationPerformStrategy,
      useExisting: BulkOperationPerformStrategyImplService,
    },
    {
      provide: NAVIGATOR_QUERY_PARAMS_CLEANUP,
      useClass: TableNavigatorQueryParamsCleanupService,
      multi: true,
    },
  ],
})
export class TableModule {
  constructor(_searchCellRegistry: CustomSearchCellRegistryService) {
    const typeDropDown: ColInput['type'] = 'DROPDOWN';
    _searchCellRegistry.registerSearchCell(typeDropDown, CustomSearchDropdownComponent);

    const typeCheckbox: ColInput['type'] = 'CHECKBOX';
    _searchCellRegistry.registerSearchCell(typeCheckbox, CustomSearchCheckboxComponent);
  }
}

export * from './components/table/table.component';
export * from './components/custom-columns/custom-columns.component';
export * from './components/custom-search-dropdown/custom-search-dropdown.component';
export * from './components/custom-search-dropdown/custom-search-checkbox.component';
export * from './components/custom-columns/custom-columns-base.component';
export * from './components/range-filter/range-filter.component';
export * from './components/date-filter/date-filter.component';
export * from './components/base-column-container/base-column-container.component';
export * from './components/paginator/paginator.component';
export * from './directives/column.directive';
export * from './shared/search-value';
export * from './shared/table-remote-data-source';
export * from './shared/table-local-data-source';
export * from './shared/table-fetch-local-data-source';
export * from './shared/table-data-source';
export * from './types/column-container';
export * from './services/table-search';
export * from './services/table-reload';
export * from './directives/search-col.directive';
export * from './directives/search-cell-def.directive';
export * from './directives/filter-connect.directive';
export * from './directives/highlight-table-row.directive';
export * from './services/custom-column-options';
export * from './directives/additional-header.directive';
export * from './components/bulk-operations/bulk-operations.component';
export * from './shared/filter-condition';
export * from './shared/table-local-data-source-config';
export * from './shared/search-column.interface';
export * from './services/filter-condition-factory.service';
export * from './shared/table-persistence-config';
export * from './services/table-persistence-config.provider';
export * from './services/table-storage.service';
export * from './shared/search-column-accessor';
export * from './services/table-highlight-item-container.service';
