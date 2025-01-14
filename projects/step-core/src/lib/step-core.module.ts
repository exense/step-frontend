import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { AngularSplitModule } from 'angular-split';
import { StepGeneratedClientModule } from './client/generated';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { KeywordNameComponent } from './components/keyword-name/keyword-name.component';
import { PlanNameComponent } from './components/plan-name/plan-name.component';
import { PredefinedOptionsInputComponent } from './components/predefined-options-input/predefined-options-input.component';
import { ReferenceArtefactNameComponent } from './components/reference-artefact-name/reference-artefact-name.component';
import { ReportNodeStatusComponent } from './components/report-node-status/report-node-status.component';
import { SettingButtonComponent } from './components/setting-button/setting-button.component';
import { CORE_INITIALIZER } from './core-initialiser';
import { CapsLockDirective } from './directives/caps-lock.directive';
import { ElementResizeDirective } from './directives/element-resize.directive';
import { FocusableDirective } from './directives/focusable.directive';
import { FocusablesDirective } from './directives/focusables.directive';
import { MaxHeightViewportHeightMinusOffsetTopDirective } from './directives/max-height-viewport-height-minus-offset-top.directive';
import { RecursiveTabIndexDirective } from './directives/recursive-tab-index.directive';
import { TooltipImmediateCloseDirective } from './directives/tooltip-immediate-close.directive';
import { TrapFocusDirective } from './directives/trap-focus.directive';
import { StepBasicsModule } from './modules/basics/step-basics.module';
import {
  CustomCellRegistryService,
  CustomRegistriesModule,
} from './modules/custom-registeries/custom-registries.module';
import { DynamicFormsModule } from './modules/dynamic-forms/dynamic-forms.module';
import { EntitiesSelectionModule } from './modules/entities-selection/entities-selection.module';
import { EntityModule } from './modules/entity/entity.module';
import { StepMaterialModule } from './modules/step-material/step-material.module';
import { TableModule } from './modules/table/table.module';
import { TREE_EXPORTS } from './modules/tree';
import { DynamicAttributePipe } from './pipes/dynamic-attribute.pipe';
import { IsChartEmptyPipe } from './pipes/is-chart-empty.pipe';
import { MatchingAuthenticator } from './pipes/matching-authenticator.pipe';
import { JsonViewerModule } from './modules/json-viewer/json-viewer.module';
import { WaitingArtefactsAdvancedComponent } from './components/waiting-artefacts-advanced/waiting-artefacts-advanced.component';
import { ResourceInputModule } from './modules/resource-input/resource-input.module';
import { FunctionActionsService, KeywordsCommonModule } from './modules/keywords-common/keywords-common.module';
import { FunctionActionsImplService } from './services/function-actions-impl.service';
import { UserSettingsButtonComponent } from './components/user-settings-button/user-settings-button.component';
import { ResourceInputWrapperComponent } from './components/resource-input-wrapper/resource-input-wrapper.component';
import { WizardModule } from './modules/wizard/wizards.module';
import { SimpleOutletComponent } from './components/simple-outlet/simple-outlet.component';
import { CronModule } from './modules/cron/cron.module';
import { HtmlDescriptionCellComponent } from './components/html-description-cell/html-description-cell.component';
import { ReportNodeIconComponent } from './components/report-node-icon/report-node-icon.component';
import { AutomationPackageCommonModule } from './modules/automation-package-common/automation-package-common.module';
import { LockColumnContainerComponent } from './components/lock-column-container/lock-column-container.component';
import { LockColumnComponent } from './components/lock-column/lock-column.component';
import { DatePickerModule } from './modules/date-picker/date-picker.module';
import { EDITABLE_LABELS_EXPORTS } from './modules/editable-labels';
import { CUSTOM_FORMS_EXPORTS } from './modules/custom-forms';
import { SCHEDULER_COMMON_EXPORTS } from './modules/scheduler-common';
import { PLAN_COMMON_EXPORTS } from './modules/plan-common';
import { IMPORT_EXPORT_EXPORTS } from './modules/import-export';
import { AUTH_EXPORTS } from './modules/auth';
import { DRAG_DROP_EXPORTS } from './modules/drag-drop';
import { BOOKMARKS_EXPORTS } from './modules/bookmarks';
import { DashboardNavigationParamsPipe } from './pipes/dashboard-navigation-params.pipe';
import { EXECUTION_COMMON_EXPORTS } from './modules/execution-common';
import { RICH_EDITOR_EXPORTS } from './modules/rich-editor';
import { MULTI_LEVEL_SELECT_EXPORTS } from './modules/multi-level-select';
import { TestIdDirective } from './directives/test-id.directive';
import { ExtractUrlPipe } from './pipes/extract-url.pipe';
import { ExtractQueryParamsPipe } from './pipes/extract-query-params.pipe';
import { REPOSITORY_PARAMETERS_INITIALIZER } from './modules/repository-parameters';
import { INFO_BANNER_EXPORTS } from './modules/info-banner';
import { TAB_EXPORTS } from './modules/tabs';
import { ArtefactInlineDetailsComponent } from './components/artefact-inline-details/artefact-inline-details.component';
import { LIST_SELECTION_EXPORTS } from './modules/list-selection';
import { SPLIT_EXPORTS } from './modules/split';

@NgModule({
  declarations: [
    MatchingAuthenticator,
    CapsLockDirective,
    TooltipImmediateCloseDirective,
    ReportNodeStatusComponent,
    ReportNodeIconComponent,
    AutorefreshToggleComponent,
    SettingButtonComponent,
    IsChartEmptyPipe,
    KeywordNameComponent,
    DynamicAttributePipe,
    ElementResizeDirective,
    TrapFocusDirective,
    FocusableDirective,
    FocusablesDirective,
    MaxHeightViewportHeightMinusOffsetTopDirective,
    RecursiveTabIndexDirective,
    ReferenceArtefactNameComponent,
    PlanNameComponent,
    PredefinedOptionsInputComponent,
    WaitingArtefactsAdvancedComponent,
    UserSettingsButtonComponent,
    ResourceInputWrapperComponent,
    SimpleOutletComponent,
    HtmlDescriptionCellComponent,
    LockColumnContainerComponent,
    LockColumnComponent,
    DashboardNavigationParamsPipe,
    TestIdDirective,
    ExtractUrlPipe,
    ExtractQueryParamsPipe,
    ArtefactInlineDetailsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StepMaterialModule,
    TableModule,
    StepBasicsModule,
    EntityModule,
    EntitiesSelectionModule,
    StepGeneratedClientModule,
    CustomRegistriesModule,
    AngularSplitModule,
    DynamicFormsModule,
    JsonViewerModule,
    ResourceInputModule,
    KeywordsCommonModule,
    AutomationPackageCommonModule,
    WizardModule,
    CronModule,
    DatePickerModule,
    AUTH_EXPORTS,
    EDITABLE_LABELS_EXPORTS,
    CUSTOM_FORMS_EXPORTS,
    SCHEDULER_COMMON_EXPORTS,
    PLAN_COMMON_EXPORTS,
    IMPORT_EXPORT_EXPORTS,
    DRAG_DROP_EXPORTS,
    BOOKMARKS_EXPORTS,
    EXECUTION_COMMON_EXPORTS,
    RICH_EDITOR_EXPORTS,
    MULTI_LEVEL_SELECT_EXPORTS,
    INFO_BANNER_EXPORTS,
    TAB_EXPORTS,
    LIST_SELECTION_EXPORTS,
    SPLIT_EXPORTS,
    TREE_EXPORTS,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CapsLockDirective,
    StepMaterialModule,
    JsonViewerModule,
    MatchingAuthenticator,
    TableModule,
    StepBasicsModule,
    EntityModule,
    EntitiesSelectionModule,
    StepGeneratedClientModule,
    CustomRegistriesModule,
    TooltipImmediateCloseDirective,
    AngularSplitModule,
    WizardModule,
    ReportNodeStatusComponent,
    ReportNodeIconComponent,
    AutorefreshToggleComponent,
    SettingButtonComponent,
    DynamicFormsModule,
    IsChartEmptyPipe,
    KeywordNameComponent,
    DynamicAttributePipe,
    ElementResizeDirective,
    TrapFocusDirective,
    FocusableDirective,
    FocusablesDirective,
    MaxHeightViewportHeightMinusOffsetTopDirective,
    RecursiveTabIndexDirective,
    PlanNameComponent,
    PredefinedOptionsInputComponent,
    LockColumnContainerComponent,
    WaitingArtefactsAdvancedComponent,
    ResourceInputModule,
    KeywordsCommonModule,
    AutomationPackageCommonModule,
    UserSettingsButtonComponent,
    ResourceInputWrapperComponent,
    CronModule,
    HtmlDescriptionCellComponent,
    LockColumnComponent,
    DatePickerModule,
    AUTH_EXPORTS,
    EDITABLE_LABELS_EXPORTS,
    CUSTOM_FORMS_EXPORTS,
    SCHEDULER_COMMON_EXPORTS,
    PLAN_COMMON_EXPORTS,
    IMPORT_EXPORT_EXPORTS,
    DRAG_DROP_EXPORTS,
    BOOKMARKS_EXPORTS,
    EXECUTION_COMMON_EXPORTS,
    DashboardNavigationParamsPipe,
    RICH_EDITOR_EXPORTS,
    MULTI_LEVEL_SELECT_EXPORTS,
    TestIdDirective,
    INFO_BANNER_EXPORTS,
    TAB_EXPORTS,
    LIST_SELECTION_EXPORTS,
    SPLIT_EXPORTS,
    TREE_EXPORTS,
    ExtractUrlPipe,
    ExtractQueryParamsPipe,
    ArtefactInlineDetailsComponent,
  ],
  providers: [
    CORE_INITIALIZER,
    REPOSITORY_PARAMETERS_INITIALIZER,
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'dd.MM.yyyy',
        },
        display: {
          dateInput: 'dd.MM.yyyy',
          monthYearLabel: 'MMM yyyy',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM yyyy',
        },
      },
    },
    {
      provide: FunctionActionsService,
      useExisting: FunctionActionsImplService,
    },
  ],
})
export class StepCoreModule {
  constructor(_cellRegistry: CustomCellRegistryService) {
    _cellRegistry.registerCell('htmlDescription', HtmlDescriptionCellComponent);
  }
}

export { BaseHttpRequest } from './client/generated/core/BaseHttpRequest';
export { CancelError, CancelablePromise } from './client/generated/core/CancelablePromise';
export { OpenAPI } from './client/generated/core/OpenAPI';
export type { OpenAPIConfig } from './client/generated/core/OpenAPI';
export * from './client/generated/index';
export * from './client/step-client-module';
export { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
export * from './components/lock-column-container/lock-column-container.component';
export * from './components/lock-column/lock-column.component';
export * from './components/html-description-cell/html-description-cell.component';
export { ReferenceArtefactNameComponent } from './components/reference-artefact-name/reference-artefact-name.component';
export { KeywordNameComponent } from './components/keyword-name/keyword-name.component';
export { PlanNameComponent } from './components/plan-name/plan-name.component';
export { PredefinedOptionsInputComponent } from './components/predefined-options-input/predefined-options-input.component';
export * from './components/report-node-status/report-node-status.component';
export * from './components/setting-button/setting-button.component';
export * from './components/link-button/link-button.component';
export * from './components/user-settings-button/user-settings-button.component';
export * from './modules/plan-common/components/artefact-details/artefact-details.component';
export * from './modules/plan-common/components/artefact-child-container-settings/artefact-child-container-settings.component';
export * from './components/artefact-inline-details/artefact-inline-details.component';
export * from './components/resource-input-wrapper/resource-input-wrapper.component';
export * from './directives/caps-lock.directive';
export { ElementResizeDirective } from './directives/element-resize.directive';
export { FocusableDirective } from './directives/focusable.directive';
export { FocusablesDirective } from './directives/focusables.directive';
export { MaxHeightViewportHeightMinusOffsetTopDirective } from './directives/max-height-viewport-height-minus-offset-top.directive';
export { RecursiveTabIndexDirective } from './directives/recursive-tab-index.directive';
export * from './directives/tooltip-immediate-close.directive';
export { TrapFocusDirective } from './directives/trap-focus.directive';
export * from './domain';
export * from './guards/check-entity-guard.factory';
export * from './modules/async-operations/async-operations.module';
export * from './modules/basics/step-basics.module';
export * from './modules/custom-registeries/custom-registries.module';
export * from './modules/dynamic-forms/dynamic-forms.module';
export * from './modules/json-forms';
export * from './modules/entities-selection/entities-selection.module';
export * from './modules/entity/entity.module';
export * from './modules/step-icons/step-icons.module';
export * from './modules/step-material/step-material.module';
export * from './modules/table/table.module';
export * from './modules/tabs';
export * from './modules/tree';
export * from './modules/repository-parameters';
export * from './modules/json-viewer/json-viewer.module';
export * from './modules/resource-input/resource-input.module';
export * from './modules/keywords-common/keywords-common.module';
export * from './modules/wizard/wizards.module';
export * from './modules/automation-package-common/automation-package-common.module';
export * from './modules/cron/cron.module';
export * from './modules/date-picker/date-picker.module';
export * from './modules/import-export';
export * from './modules/plan-common';
export * from './modules/routing';
export * from './modules/auth';
export * from './modules/is-used-by';
export * from './pipes/dynamic-attribute.pipe';
export * from './pipes/is-chart-empty.pipe';
export * from './pipes/matching-authenticator.pipe';
export * from './services/artefact-refresh-notification.service';
export * from './services/deferred-link-processor.service';
export * from './services/execution-close-handle.service';
export * from './services/global-progress-spinner.service';
export * from './services/http-interceptor-bridge.service';
export * from './services/invoke-run.service';
export * from './services/link-processor.service';
export * from './services/task-by-id-cache.service';
export * from './services/plugin-info-registry.service';
export * from './services/artefact.service';
export * from './modules/plan-common/injectables/artefact-form-change-helper.service';
export * from './services/function-actions-impl.service';
export * from './shared';
export * from './modules/basics/types/api-token.interface';
export * from './modules/editable-labels';
export * from './modules/custom-forms';
export * from './modules/scheduler-common';
export * from './modules/execution-common';
export * from './modules/split';
export * from './components/base-artefact/base-artefact.component';
export * from './components/base-artefact/base-inline-artefact.component';
export * from './components/base-artefact/artefact-inline-item';
export * from './components/waiting-artefacts-advanced/waiting-artefacts-advanced.component';
export * from './modules/plan-common/components/artefact-details/artefact-details.component';
export * from './components/simple-outlet/simple-outlet.component';
export * from './services/special-links.service';
export * from './shared/special-links-strategy';
export * from './modules/entity/pipes/cast-entity-to-plan.pipe';
export * from './modules/entity/pipes/cast-entity-to-execution.pipe';
export * from './modules/entity/pipes/cast-entity-to-task.pipe';
export * from './modules/bookmarks';
export * from './services/auto-refresh-model-factory.service';
export * from './services/artefacts-factory.service';
export * from './services/keyword-executor.service';
export * from './components/report-node-icon/report-node-icon.component';
export * from './modules/drag-drop';
export * from './modules/list-selection';
export * from './pipes/dashboard-navigation-params.pipe';
export * from './modules/rich-editor';
export * from './modules/multi-level-select';
export { TestIdDirective } from './directives/test-id.directive';
export * from './modules/info-banner';
export * from './pipes/extract-url.pipe';
export * from './pipes/extract-query-params.pipe';
