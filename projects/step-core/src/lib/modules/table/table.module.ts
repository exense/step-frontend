import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { StepMaterialModule } from '../step-material/step-material.module';
import { TableComponent } from './components/table/table.component';
import { SearchColDirective } from './directives/search-col.directive';
import { SearchCellDefDirective } from './directives/search-cell-def.directive';
import { Input as ColInput, TableRemoteDataSourceFactoryService } from '../../client/step-client-module';
import { CustomColumnsComponent } from './components/custom-columns/custom-columns.component';
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
import { CustomSearchCheckboxComponent } from './components/custom-search-checkbox/custom-search-checkbox.component';
import { TableRemoteDataSourceFactoryImplService } from './services/table-remote-data-source-factory-impl.service';
import { BulkOperationPerformStrategyImplService } from './services/bulk-operation-perform-strategy-impl.service';
import { HighlightTableRowDirective } from './directives/highlight-table-row.directive';
import { DatePickerModule } from '../date-picker/date-picker.module';
import { RangeFilterComponent } from './components/range-filter/range-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { TableNavigatorQueryParamsCleanupService } from './services/table-navigator-query-params-cleanup.service';
import { NAVIGATOR_QUERY_PARAMS_CLEANUP } from '../routing';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { EDITABLE_LABELS_EXPORTS } from '../editable-labels';
import { AUTH_EXPORTS } from '../auth';
import { DRAG_DROP_EXPORTS } from '../drag-drop';
import { DragColumnCaptionComponent } from './components/drag-column-caption/drag-column-caption.component';
import { ColumnSettingsComponent } from './components/column-settings/column-settings.component';
import { ActivityColDirective } from './directives/activity-col.directive';
import { HeaderCellContainerComponent } from './components/header-cell-container/header-cell-container.component';
import { ColumnSettingsSaveDashletComponent } from './components/column-settings-save-dashlet/column-settings-save-dashlet.component';
import { ActionColDirective } from './directives/action-col.directive';
import { CustomCellColInputPipe } from './pipe/custom-cell-col-input.pipe';
import { CustomCellApplySubPathPipe } from './pipe/custom-cell-apply-sub-path.pipe';
import { SettingsInsideActionColDirective } from './directives/settings-inside-action-col.directive';
import { RowsExtensionDirective } from './directives/rows-extension.directive';
import { RowDirective } from './directives/row.directive';
import { TablePaginatorAddonDirective } from './directives/table-paginator-addon.directive';

@NgModule({
  imports: [
    CommonModule,
    StepMaterialModule,
    EntitiesSelectionModule,
    CustomRegistriesModule,
    AsyncOperationsModule,
    EDITABLE_LABELS_EXPORTS,
    StepBasicsModule,
    DatePickerModule,
    AUTH_EXPORTS,
    DRAG_DROP_EXPORTS,
  ],
  declarations: [
    TableComponent,
    SearchColDirective,
    SearchCellDefDirective,
    TablePaginatorAddonDirective,
    CustomColumnsComponent,
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
    DragColumnCaptionComponent,
    ColumnSettingsComponent,
    PaginatorComponent,
    ActivityColDirective,
    ActionColDirective,
    HeaderCellContainerComponent,
    ColumnSettingsSaveDashletComponent,
    CustomCellColInputPipe,
    CustomCellApplySubPathPipe,
    SettingsInsideActionColDirective,
    RowDirective,
    RowsExtensionDirective,
  ],
  exports: [
    TableComponent,
    SearchColDirective,
    TablePaginatorAddonDirective,
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
    DragColumnCaptionComponent,
    ColumnSettingsComponent,
    PaginatorComponent,
    ActivityColDirective,
    ActionColDirective,
    HeaderCellContainerComponent,
    ColumnSettingsSaveDashletComponent,
    SettingsInsideActionColDirective,
    RowsExtensionDirective,
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
export * from './components/custom-search-checkbox/custom-search-checkbox.component';
export * from './components/custom-columns/custom-columns-base.component';
export * from './components/range-filter/range-filter.component';
export * from './components/date-filter/date-filter.component';
export * from './components/drag-column-caption/drag-column-caption.component';
export * from './components/column-settings/column-settings.component';
export * from './components/header-cell-container/header-cell-container.component';
export * from './components/base-column-container/base-column-container.component';
export * from './components/paginator/paginator.component';
export * from './components/column-settings-save-dashlet/column-settings-save-dashlet.component';
export * from './directives/rows-extension.directive';
export * from './directives/column.directive';
export * from './directives/activity-col.directive';
export * from './directives/action-col.directive';
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
export * from './directives/settings-inside-action-col.directive';
export * from './directives/table-paginator-addon.directive';
export * from './services/custom-column-options';
export * from './directives/additional-header.directive';
export * from './components/bulk-operations/bulk-operations.component';
export * from './shared/filter-condition';
export * from './shared/table-local-data-source-config';
export * from './shared/search-column.interface';
export * from './shared/request-filter-interceptor';
export * from './shared/filter-condition-type.enum';
export * from './services/request-filter-interceptors.token';
export * from './services/request-filter-interceptors.token';
export * from './services/filter-condition-factory.service';
export * from './shared/table-persistence-config';
export * from './services/table-persistence-config.provider';
export * from './services/table-storage.service';
export * from './shared/search-column-accessor';
export * from './services/table-highlight-item-container.service';
export * from './services/table-columns-config.provider';
export * from './services/table-columns.service';
export * from './services/items-per-page.service';
export * from './services/table-persistence-state.service';
export * from './services/table-persistence-url-state.service';
export * from './types/row-info.interface';
export * from './services/table-memory-storage.service';
export * from './services/table-local-storage.service';
