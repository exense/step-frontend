import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { AngularSplitModule } from 'angular-split';
import { StepGeneratedClientModule } from './client/generated';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { DynamicLabelCustomFormInputComponent } from './components/custom-form-input/dynamic-label-custom-form-input.component';
import { StandardCustomFormInputComponent } from './components/custom-form-input/standard-custom-form-input.component';
import { CustomFormWrapperComponent } from './components/custom-form-wrapper/custom-form-wrapper.component';
import { CustomFormComponent } from './components/custom-form/custom-form.component';
import { EditSchedulerTaskDialogComponent } from './components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
import { EditableActionsComponent } from './components/editable-actions/editable-actions.component';
import { EditableDropdownLabelComponent } from './components/editable-dropdown-label/editable-dropdown-label.component';
import { EditableLabelComponent } from './components/editable-label/editable-label.component';
import { EditableTextareaLabelComponent } from './components/editable-textarea-label/editable-textarea-label.component';
import { EntityColumnContainerComponent } from './components/entity-column-container/entity-column-container.component';
import { EntityColumnComponent } from './components/entity-column/entity-column.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { IsUsedByListComponent } from './components/is-used-by-list/is-used-by-list.component';
import { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';
import { KeywordNameComponent } from './components/keyword-name/keyword-name.component';
import { PlanCreateDialogComponent } from './components/plan-create-dialog/plan-create-dialog.component';
import { PlanLinkComponent } from './components/plan-link/plan-link.component';
import { PlanNameComponent } from './components/plan-name/plan-name.component';
import { PlanTreeComponent } from './components/plan-tree/plan-tree.component';
import { PredefinedOptionsInputComponent } from './components/predefined-options-input/predefined-options-input.component';
import { ReferenceArtefactNameComponent } from './components/reference-artefact-name/reference-artefact-name.component';
import { ReportNodeStatusComponent } from './components/report-node-status/report-node-status.component';
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
import { TooltipImmediateCloseDirective } from './directives/tooltip-immediate-close.directive';
import { TrapFocusDirective } from './directives/trap-focus.directive';
import { REPOSITORY_PARAMETERS_INITIALIZER, StepBasicsModule } from './modules/basics/step-basics.module';
import {
  CustomCellRegistryService,
  CustomRegistriesModule,
} from './modules/custom-registeries/custom-registries.module';
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
import { JsonViewerModule } from './modules/json-viewer/json-viewer.module';
import { WaitingArtefactsAdvancedComponent } from './components/waiting-artefacts-advanced/waiting-artefacts-advanced.component';
import { ResourceInputModule } from './modules/resource-input/resource-input.module';
import { ProjectNamePipe } from './pipes/project-name.pipe';
import { FunctionActionsService, KeywordsCommonModule } from './modules/keywords-common/keywords-common.module';
import { FunctionActionsImplService } from './services/function-actions-impl.service';
import { MyAccountButtonComponent } from './components/my-account-button/my-account-button.component';
import { SelectTaskComponent } from './components/select-task/select-task.component';
import { SchedulerTaskLinkComponent } from './components/scheduler-task-link/scheduler-task-link.component';
import { ResourceInputWrapperComponent } from './components/resource-input-wrapper/resource-input-wrapper.component';
import { WizardModule } from './modules/wizard/wizards.module';
import { SimpleOutletComponent } from './components/simple-outlet/simple-outlet.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ImportDialogComponent } from './components/import-dialog/import-dialog.component';
import { CronModule } from './modules/cron/cron.module';
import { HtmlDescriptionCellComponent } from './components/html-description-cell/html-description-cell.component';
import { EnterTextValueDialogComponent } from './components/enter-text-value-dialog/enter-text-value-dialog.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { MessagesListDialogComponent } from './components/messages-list-dialog/messages-list-dialog.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { ReportNodeIconComponent } from './components/report-node-icon/report-node-icon.component';
import { AutomationPackageCommonModule } from './modules/automation-package-common/automation-package-common.module';
import { LockColumnContainerComponent } from './components/lock-column-container/lock-column-container.component';
import { LockColumnComponent } from './components/lock-column/lock-column.component';
import { DatePickerModule } from './modules/date-picker/date-picker.module';
import { EditableLabelTemplateDirective } from './directives/editable-label-template.directive';

@NgModule({
  declarations: [
    MatchingAuthenticator,
    DashboardLinkPipe,
    CapsLockDirective,
    TooltipImmediateCloseDirective,
    ReportNodeStatusComponent,
    ReportNodeIconComponent,
    PlanLinkComponent,
    SchedulerTaskLinkComponent,
    PlanNamePipe,
    IsUsedByListComponent,
    IsUsedByModalComponent,
    SelectPlanComponent,
    AutorefreshToggleComponent,
    SettingButtonComponent,
    PlanTreeComponent,
    EditableActionsComponent,
    EditableLabelComponent,
    EditableTextareaLabelComponent,
    EditableDropdownLabelComponent,
    IsChartEmptyPipe,
    KeywordNameComponent,
    DynamicAttributePipe,
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
    PredefinedOptionsInputComponent,
    CustomFormWrapperComponent,
    EntityColumnComponent,
    EntityColumnContainerComponent,
    EditSchedulerTaskDialogComponent,
    ExportDialogComponent,
    ArtefactDetailsComponent,
    WaitingArtefactsAdvancedComponent,
    ProjectNamePipe,
    MyAccountButtonComponent,
    SelectTaskComponent,
    ResourceInputWrapperComponent,
    SimpleOutletComponent,
    SettingsComponent,
    ImportDialogComponent,
    HtmlDescriptionCellComponent,
    EnterTextValueDialogComponent,
    ConfirmationDialogComponent,
    MessagesListDialogComponent,
    MessageDialogComponent,
    LockColumnContainerComponent,
    LockColumnComponent,
    EditableLabelTemplateDirective,
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
    TabsModule,
    TreeModule,
    AngularSplitModule,
    DynamicFormsModule,
    JsonViewerModule,
    ResourceInputModule,
    KeywordsCommonModule,
    AutomationPackageCommonModule,
    WizardModule,
    CronModule,
    DatePickerModule,
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
    WizardModule,
    ReportNodeStatusComponent,
    ReportNodeIconComponent,
    PlanLinkComponent,
    SchedulerTaskLinkComponent,
    PlanNamePipe,
    IsUsedByModalComponent,
    SelectPlanComponent,
    PlanTreeComponent,
    AutorefreshToggleComponent,
    SettingButtonComponent,
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
    PredefinedOptionsInputComponent,
    CustomFormWrapperComponent,
    EntityColumnComponent,
    EntityColumnContainerComponent,
    LockColumnContainerComponent,
    EditSchedulerTaskDialogComponent,
    ExportDialogComponent,
    ArtefactDetailsComponent,
    WaitingArtefactsAdvancedComponent,
    ResourceInputModule,
    ProjectNamePipe,
    KeywordsCommonModule,
    AutomationPackageCommonModule,
    MyAccountButtonComponent,
    SelectTaskComponent,
    ResourceInputWrapperComponent,
    SettingsComponent,
    ImportDialogComponent,
    CronModule,
    HtmlDescriptionCellComponent,
    EnterTextValueDialogComponent,
    ConfirmationDialogComponent,
    MessagesListDialogComponent,
    MessageDialogComponent,
    LockColumnComponent,
    DatePickerModule,
    EditableLabelTemplateDirective,
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
export { DynamicLabelCustomFormInputComponent } from './components/custom-form-input/dynamic-label-custom-form-input.component';
export { StandardCustomFormInputComponent } from './components/custom-form-input/standard-custom-form-input.component';
export { CustomFormWrapperComponent } from './components/custom-form-wrapper/custom-form-wrapper.component';
export { CustomFormComponent } from './components/custom-form/custom-form.component';
export * from './components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
export { EditableDropdownLabelComponent } from './components/editable-dropdown-label/editable-dropdown-label.component';
export { EditableLabelComponent } from './components/editable-label/editable-label.component';
export { EditableTextareaLabelComponent } from './components/editable-textarea-label/editable-textarea-label.component';
export * from './components/entity-column-container/entity-column-container.component';
export * from './components/entity-column/entity-column.component';
export * from './components/lock-column-container/lock-column-container.component';
export * from './components/lock-column/lock-column.component';
export * from './components/export-dialog/export-dialog.component';
export * from './components/import-dialog/import-dialog.component';
export { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';
export * from './components/html-description-cell/html-description-cell.component';
export { ReferenceArtefactNameComponent } from './components/reference-artefact-name/reference-artefact-name.component';
export { KeywordNameComponent } from './components/keyword-name/keyword-name.component';
export { PlanCreateDialogComponent } from './components/plan-create-dialog/plan-create-dialog.component';
export * from './components/plan-link/plan-link.component';
export * from './components/scheduler-task-link/scheduler-task-link.component';
export { PlanLinkDialogService } from './components/plan-link/plan-link-dialog.service';
export { PlanNameComponent } from './components/plan-name/plan-name.component';
export * from './components/plan-tree/plan-tree.component';
export { PredefinedOptionsInputComponent } from './components/predefined-options-input/predefined-options-input.component';
export * from './components/report-node-status/report-node-status.component';
export * from './components/select-plan/select-plan.component';
export * from './components/select-task/select-task.component';
export * from './components/setting-button/setting-button.component';
export * from './components/link-button/link-button.component';
export * from './components/my-account-button/my-account-button.component';
export { SplitAreaComponent } from './components/split-area/split-area.component';
export { SplitGutterComponent } from './components/split-gutter/split-gutter.component';
export { SplitComponent } from './components/split/split.component';
export * from './components/thread-distribution-wizard-dialog/thread-distribution-wizard-dialog.component';
export * from './components/entity-column/entity-column.component';
export * from './components/entity-column-container/entity-column-container.component';
export * from './components/edit-scheduler-task-dialog/edit-scheduler-task-dialog.component';
export * from './components/artefact-details/artefact-details.component';
export * from './components/resource-input-wrapper/resource-input-wrapper.component';
export * from './components/settings/settings.component';
export * from './directives/caps-lock.directive';
export { ElementResizeDirective } from './directives/element-resize.directive';
export { FocusableDirective } from './directives/focusable.directive';
export { FocusablesDirective } from './directives/focusables.directive';
export * from './directives/input-model-formatter.directive';
export { MaxHeightViewportHeightMinusOffsetTopDirective } from './directives/max-height-viewport-height-minus-offset-top.directive';
export { RecursiveTabIndexDirective } from './directives/recursive-tab-index.directive';
export * from './directives/tooltip-immediate-close.directive';
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
export * from './modules/json-viewer/json-viewer.module';
export * from './modules/resource-input/resource-input.module';
export * from './modules/keywords-common/keywords-common.module';
export * from './modules/wizard/wizards.module';
export * from './modules/automation-package-common/automation-package-common.module';
export * from './modules/cron/cron.module';
export * from './modules/date-picker/date-picker.module';
export * from './pipes/dashboard-link.pipe';
export * from './pipes/dynamic-attribute.pipe';
export * from './pipes/is-chart-empty.pipe';
export * from './pipes/project-name.pipe';
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
export * from './services/scheduler-actions.service';
export { ImportDialogsService } from './services/import-dialogs.service';
export * from './services/invoke-run.service';
export { IsUsedByDialogService } from './services/is-used-by-dialog.service';
export * from './services/link-processor.service';
export * from './services/menu-items-override-config.service';
export * from './services/plan-artefact-resolver.service';
export * from './services/plan-by-id-cache.service';
export * from './services/task-by-id-cache.service';
export { PlanDialogsService } from './services/plan-dialogs.service';
export * from './services/plan-editor.service';
export * from './services/plan-interactive-session.service';
export * from './services/plan-setup.service';
export * from './services/plugin-info-registry.service';
export * from './services/plan-editor-api.service';
export * from './services/scheduled-task-dialogs.service';
export * from './services/view-registry.service';
export * from './services/view-state.service';
export * from './services/artefact.service';
export * from './services/artefact-form-change-helper.service';
export * from './services/function-actions-impl.service';
export * from './services/plan-editor-persistence-state.service';
export * from './shared';
export * from './modules/basics/shared/api-token.interface';
export * from './components/base-artefact/base-artefact.component';
export * from './components/waiting-artefacts-advanced/waiting-artefacts-advanced.component';
export * from './components/artefact-details/artefact-details.component';
export * from './components/simple-outlet/simple-outlet.component';
export * from './services/special-links.service';
export * from './shared/special-links-strategy';
export * from './modules/entity/pipes/cast-entity-to-plan.pipe';
export * from './modules/entity/pipes/cast-entity-to-execution.pipe';
export * from './modules/entity/pipes/cast-entity-to-task.pipe';
export * from './services/auto-refresh-model-factory.service';
export * from './services/artefacts-factory.service';
export * from './services/plan-open.service';
export * from './services/keyword-executor.service';
export * from './components/enter-text-value-dialog/enter-text-value-dialog.component';
export * from './components/confirmation-dialog/confirmation-dialog.component';
export * from './components/messages-list-dialog/messages-list-dialog.component';
export * from './components/message-dialog/message-dialog.component';
export * from './components/report-node-icon/report-node-icon.component';
export * from './directives/editable-label-template.directive';
