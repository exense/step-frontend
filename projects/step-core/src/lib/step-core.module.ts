import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { AngularSplitModule } from 'angular-split';
import { StepGeneratedClientModule } from './client/generated';
import { AgentTokenSelectionCriteriaComponent } from './components/agent-token-selection-criteria/agent-token-selection-criteria.component';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { DynamicLabelCustomFormInputComponent } from './components/custom-form-input/dynamic-label-custom-form-input.component';
import { StandardCustomFormInputComponent } from './components/custom-form-input/standard-custom-form-input.component';
import { CustomFormWrapperComponent } from './components/custom-form-wrapper/custom-form-wrapper.component';
import { CustomFormComponent } from './components/custom-form/custom-form.component';
import { DynamicResourceInputComponent } from './components/dynamic-resource-input/dynamic-resource-input.component';
import { EditSchedulerTaskDialogComponent } from './components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { EditableActionsComponent } from './components/editable-actions/editable-actions.component';
import { EditableDropdownLabelComponent } from './components/editable-dropdown-label/editable-dropdown-label.component';
import { EditableLabelComponent } from './components/editable-label/editable-label.component';
import { EditableTextareaLabelComponent } from './components/editable-textarea-label/editable-textarea-label.component';
import { EntityColumnContainerComponent } from './components/entity-column-container/entity-column-container.component';
import { EntityColumnComponent } from './components/entity-column/entity-column.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { FunctionLinkComponent } from './components/function-link/function-link.component';
import { IsUsedByListComponent } from './components/is-used-by-list/is-used-by-list.component';
import { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';
import { KeywordNameComponent } from './components/keyword-name/keyword-name.component';
import { NewSchedulerTaskDialogComponent } from './components/new-scheduler-task-dialog/new-scheduler-task-dialog.component';
import { PlanCreateDialogComponent } from './components/plan-create-dialog/plan-create-dialog.component';
import { PlanLinkComponent } from './components/plan-link/plan-link.component';
import { PlanNameComponent } from './components/plan-name/plan-name.component';
import { PlanTreeActionsComponent } from './components/plan-tree-actions/plan-tree-actions.component';
import { PlanTreeComponent } from './components/plan-tree/plan-tree.component';
import { PredefinedOptionsInputComponent } from './components/predefined-options-input/predefined-options-input.component';
import { ReferenceArtefactNameComponent } from './components/reference-artefact-name/reference-artefact-name.component';
import { ReportNodeStatusComponent } from './components/report-node-status/report-node-status.component';
import { RestoreDialogComponent } from './components/restore-dialog/restore-dialog.component';
import { SelectPlanComponent } from './components/select-plan/select-plan.component';
import { SettingButtonComponent } from './components/setting-button/setting-button.component';
import { SplitAreaComponent } from './components/split-area/split-area.component';
import { SplitGutterComponent } from './components/split-gutter/split-gutter.component';
import { SplitComponent } from './components/split/split.component';
import { ThreadDistributionWizardDialogComponent } from './components/thread-distribution-wizard-dialog/thread-distribution-wizard-dialog.component';
import { CORE_INITIALIZER } from './core-initialiser';
import { CapsLockDirective } from './directives/caps-lock.directive';
import { ElementResizeDirective } from './directives/element-resize.directive';
import { FocusableDirective } from './directives/focusable.directive';
import { FocusablesDirective } from './directives/focusables.directive';
import { InputModelFormatterDirective } from './directives/input-model-formatter.directive';
import { MaxHeightViewportHeightMinusOffsetTopDirective } from './directives/max-height-viewport-height-minus-offset-top.directive';
import { RecursiveTabIndexDirective } from './directives/recursive-tab-index.directive';
import { SimpleLineChartDirective } from './directives/simple-line-chart.directive';
import { TooltipImmediateCloseDirective } from './directives/tooltip-immediate-close.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { TrapFocusDirective } from './directives/trap-focus.directive';
import {
  IsUsedByDialog,
  REPOSITORY_PARAMETERS_INITIALIZER,
  StepBasicsModule,
} from './modules/basics/step-basics.module';
import { CustomRegistriesModule } from './modules/custom-registeries/custom-registries.module';
import { DynamicFormsModule } from './modules/dynamic-forms/dynamic-forms.module';
import { EntitiesSelectionModule } from './modules/entities-selection/entities-selection.module';
import { EntityModule } from './modules/entity/entity.module';
import { StepMaterialModule } from './modules/step-material/step-material.module';
import { TableModule } from './modules/table/table.module';
import { TabsModule } from './modules/tabs/tabs.module';
import { TreeModule } from './modules/tree/tree.module';
import { CustomFormInputModelPipe } from './pipes/custom-form-input-model.pipe';
import { DashboardLinkPipe } from './pipes/dashboard-link.pipe';
import { DynamicAttributePipe } from './pipes/dynamic-attribute.pipe';
import { IsChartEmptyPipe } from './pipes/is-chart-empty.pipe';
import { MatchingAuthenticator } from './pipes/matching-authenticator.pipe';
import { PlanNamePipe } from './pipes/plan-name.pipe';
import { ArtefactDetailsComponent } from './components/artefact-details/artefact-details.component';
import { WaitingArtefactsAdvancedComponent } from './components/waiting-artefacts-advanced/waiting-artefacts-advanced.component';
import { ResourceInputModule } from './modules/resource-input/resource-input.module';
import { IsUsedByDialogService } from './services/is-used-by-dialog.service';

@NgModule({
  declarations: [
    TooltipDirective,
    MatchingAuthenticator,
    DashboardLinkPipe,
    CapsLockDirective,
    TooltipImmediateCloseDirective,
    ReportNodeStatusComponent,
    PlanLinkComponent,
    PlanNamePipe,
    IsUsedByListComponent,
    IsUsedByModalComponent,
    FunctionLinkComponent,
    SelectPlanComponent,
    AutorefreshToggleComponent,
    SettingButtonComponent,
    PlanTreeComponent,
    RestoreDialogComponent,
    SimpleLineChartDirective,
    EditableActionsComponent,
    EditableLabelComponent,
    EditableTextareaLabelComponent,
    EditableDropdownLabelComponent,
    IsChartEmptyPipe,
    KeywordNameComponent,
    DynamicAttributePipe,
    PlanTreeActionsComponent,
    CustomFormComponent,
    DynamicLabelCustomFormInputComponent,
    StandardCustomFormInputComponent,
    CustomFormInputModelPipe,
    SplitComponent,
    SplitAreaComponent,
    SplitGutterComponent,
    ElementResizeDirective,
    TrapFocusDirective,
    FocusableDirective,
    FocusablesDirective,
    MaxHeightViewportHeightMinusOffsetTopDirective,
    RecursiveTabIndexDirective,
    ReferenceArtefactNameComponent,
    PlanNameComponent,
    PlanCreateDialogComponent,
    InputModelFormatterDirective,
    ThreadDistributionWizardDialogComponent,
    DynamicResourceInputComponent,
    AgentTokenSelectionCriteriaComponent,
    PredefinedOptionsInputComponent,
    UpdateResourceWarningDialogComponent,
    CustomFormWrapperComponent,
    EntityColumnComponent,
    EntityColumnContainerComponent,
    NewSchedulerTaskDialogComponent,
    EditSchedulerTaskDialogComponent,
    ExportDialogComponent,
    ArtefactDetailsComponent,
    WaitingArtefactsAdvancedComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UpgradeModule,
    StepMaterialModule,
    TableModule,
    StepBasicsModule,
    EntityModule,
    EntitiesSelectionModule,
    StepGeneratedClientModule,
    CustomRegistriesModule,
    TabsModule,
    TreeModule,
    AngularSplitModule,
    DynamicFormsModule,
    ResourceInputModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UpgradeModule,
    TooltipDirective,
    CapsLockDirective,
    StepMaterialModule,
    MatchingAuthenticator,
    DashboardLinkPipe,
    TableModule,
    StepBasicsModule,
    EntityModule,
    EntitiesSelectionModule,
    StepGeneratedClientModule,
    CustomRegistriesModule,
    TabsModule,
    TooltipImmediateCloseDirective,
    TreeModule,
    AngularSplitModule,
    ReportNodeStatusComponent,
    PlanLinkComponent,
    PlanNamePipe,
    IsUsedByModalComponent,
    SelectPlanComponent,
    PlanTreeComponent,
    AutorefreshToggleComponent,
    SettingButtonComponent,
    RestoreDialogComponent,
    SimpleLineChartDirective,
    EditableLabelComponent,
    EditableTextareaLabelComponent,
    EditableDropdownLabelComponent,
    DynamicFormsModule,
    IsChartEmptyPipe,
    KeywordNameComponent,
    DynamicAttributePipe,
    CustomFormComponent,
    DynamicLabelCustomFormInputComponent,
    StandardCustomFormInputComponent,
    SplitComponent,
    SplitAreaComponent,
    SplitGutterComponent,
    ElementResizeDirective,
    TrapFocusDirective,
    FocusableDirective,
    FocusablesDirective,
    MaxHeightViewportHeightMinusOffsetTopDirective,
    RecursiveTabIndexDirective,
    PlanNameComponent,
    PlanCreateDialogComponent,
    InputModelFormatterDirective,
    ThreadDistributionWizardDialogComponent,
    DynamicResourceInputComponent,
    AgentTokenSelectionCriteriaComponent,
    PredefinedOptionsInputComponent,
    UpdateResourceWarningDialogComponent,
    CustomFormWrapperComponent,
    EntityColumnComponent,
    EntityColumnContainerComponent,
    NewSchedulerTaskDialogComponent,
    EditSchedulerTaskDialogComponent,
    ExportDialogComponent,
    ArtefactDetailsComponent,
    WaitingArtefactsAdvancedComponent,
    ResourceInputModule,
  ],
  providers: [
    CORE_INITIALIZER,
    REPOSITORY_PARAMETERS_INITIALIZER,
    {
      provide: MAT_LUXON_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: true },
    },
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
      provide: IsUsedByDialog,
      useExisting: IsUsedByDialogService,
    },
  ],
})
export class StepCoreModule {}

export * from './angularjs';
export { BaseHttpRequest } from './client/generated/core/BaseHttpRequest';
export { CancelError, CancelablePromise } from './client/generated/core/CancelablePromise';
export { OpenAPI } from './client/generated/core/OpenAPI';
export type { OpenAPIConfig } from './client/generated/core/OpenAPI';
export * from './client/generated/index';
export * from './client/step-client-module';
export { AgentTokenSelectionCriteriaComponent } from './components/agent-token-selection-criteria/agent-token-selection-criteria.component';
export { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
export { DynamicLabelCustomFormInputComponent } from './components/custom-form-input/dynamic-label-custom-form-input.component';
export { StandardCustomFormInputComponent } from './components/custom-form-input/standard-custom-form-input.component';
export { CustomFormWrapperComponent } from './components/custom-form-wrapper/custom-form-wrapper.component';
export { CustomFormComponent } from './components/custom-form/custom-form.component';
export { DynamicResourceInputComponent } from './components/dynamic-resource-input/dynamic-resource-input.component';
export * from './components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
export { EditableDropdownLabelComponent } from './components/editable-dropdown-label/editable-dropdown-label.component';
export { EditableLabelComponent } from './components/editable-label/editable-label.component';
export { EditableTextareaLabelComponent } from './components/editable-textarea-label/editable-textarea-label.component';
export * from './components/entity-column-container/entity-column-container.component';
export * from './components/entity-column/entity-column.component';
export * from './components/export-dialog/export-dialog.component';
export { FunctionLinkDialogService } from './components/function-link/function-link-dialog.service';
export { FunctionLinkComponent } from './components/function-link/function-link.component';
export { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';
export { KeywordNameComponent } from './components/keyword-name/keyword-name.component';
export * from './components/new-scheduler-task-dialog/new-scheduler-task-dialog.component';
export { PlanCreateDialogComponent } from './components/plan-create-dialog/plan-create-dialog.component';
export { PlanLinkComponent } from './components/plan-link/plan-link.component';
export { PlanNameComponent } from './components/plan-name/plan-name.component';
export * from './components/plan-tree/plan-tree.component';
export { PredefinedOptionsInputComponent } from './components/predefined-options-input/predefined-options-input.component';
export { ReferenceArtefactNameComponent } from './components/reference-artefact-name/reference-artefact-name.component';
export * from './components/report-node-status/report-node-status.component';
export { RestoreDialogComponent } from './components/restore-dialog/restore-dialog.component';
export { SelectPlanComponent } from './components/select-plan/select-plan.component';
export { SettingButtonComponent } from './components/setting-button/setting-button.component';
export { SplitAreaComponent } from './components/split-area/split-area.component';
export { SplitGutterComponent } from './components/split-gutter/split-gutter.component';
export { SplitComponent } from './components/split/split.component';
export * from './components/thread-distribution-wizard-dialog/thread-distribution-wizard-dialog.component';
export * from './components/entity-column/entity-column.component';
export * from './components/entity-column-container/entity-column-container.component';
export * from './components/new-scheduler-task-dialog/new-scheduler-task-dialog.component';
export * from './components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
export * from './decorators/plugin';
export * from './directives/caps-lock.directive';
export { ElementResizeDirective } from './directives/element-resize.directive';
export { FocusableDirective } from './directives/focusable.directive';
export { FocusablesDirective } from './directives/focusables.directive';
export * from './directives/input-model-formatter.directive';
export { MaxHeightViewportHeightMinusOffsetTopDirective } from './directives/max-height-viewport-height-minus-offset-top.directive';
export { RecursiveTabIndexDirective } from './directives/recursive-tab-index.directive';
export * from './directives/simple-line-chart.directive';
export * from './directives/tooltip-immediate-close.directive';
export * from './directives/tooltip.directive';
export { TrapFocusDirective } from './directives/trap-focus.directive';
export * from './domain';
export * from './modules/async-operations/async-operations.module';
export * from './modules/basics/step-basics.module';
export * from './modules/custom-registeries/custom-registries.module';
export * from './modules/dynamic-forms/dynamic-forms.module';
export * from './modules/entities-selection/entities-selection.module';
export * from './modules/entity/entity.module';
export * from './modules/step-icons/step-icons.module';
export * from './modules/step-material/step-material.module';
export * from './modules/table/table.module';
export * from './modules/tabs/tabs.module';
export * from './modules/tree/tree.module';
export * from './modules/resource-input/resource-input.module';
export * from './pipes/dashboard-link.pipe';
export * from './pipes/dynamic-attribute.pipe';
export * from './pipes/is-chart-empty.pipe';
export * from './pipes/matching-authenticator.pipe';
export { PlanNamePipe } from './pipes/plan-name.pipe';
export * from './services/additional-right-rule.service';
export * from './services/artefact-refresh-notification.service';
export * from './services/dashboard.service';
export * from './services/deferred-link-processor.service';
export * from './services/execution-close-handle.service';
export * from './services/export-dialogs.service';
export * from './services/global-progress-spinner.service';
export * from './services/http-interceptor-bridge.service';
export { ImportDialogsService } from './services/import-dialogs.service';
export * from './services/invoke-run.service';
export { IsUsedByDialogService } from './services/is-used-by-dialog.service';
export * from './services/link-processor.service';
export * from './services/menu-items-override-config.service';
export * from './services/plan-artefact-resolver.service';
export * from './services/plan-by-id-cache.service';
export { PlanDialogsService } from './services/plan-dialogs.service';
export * from './services/plan-editor.service';
export * from './services/plan-interactive-session.service';
export * from './services/plugin-info-registry.service';
export * from './services/restore-dialogs.service';
export * from './services/scheduled-task-dialogs.service';
export { UibModalHelperService, UibModalInstance } from './services/uib-modal-helper.service';
export * from './services/view-registry.service';
export * from './services/view-state.service';
export * from './services/artefact.service';
export * from './services/artefact-form-change-helper.service';
export * from './shared';
export * from './components/base-artefact/base-artefact.component';
export * from './components/waiting-artefacts-advanced/waiting-artefacts-advanced.component';
export * from './components/artefact-details/artefact-details.component';
