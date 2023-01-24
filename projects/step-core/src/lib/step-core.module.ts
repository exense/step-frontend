import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { AngularSplitModule } from 'angular-split';
import { StepGeneratedClientModule } from './client/generated';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { EditableActionsComponent } from './components/editable-actions/editable-actions.component';
import { EditableDropdownLabelComponent } from './components/editable-dropdown-label/editable-dropdown-label.component';
import { EditableLabelComponent } from './components/editable-label/editable-label.component';
import { EditableTextareaLabelComponent } from './components/editable-textarea-label/editable-textarea-label.component';
import { FunctionLinkComponent } from './components/function-link/function-link.component';
import { IsUsedByListComponent } from './components/is-used-by-list/is-used-by-list.component';
import { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';
import { ModalWindowComponent } from './components/modal-window/modal-window.component';
import { PlanLinkComponent } from './components/plan-link/plan-link.component';
import { PlanTreeComponent } from './components/plan-tree/plan-tree.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { ReportNodeStatusComponent } from './components/report-node-status/report-node-status.component';
import { SelectPlanComponent } from './components/select-plan/select-plan.component';
import { SettingBtnComponent } from './components/setting-btn/setting-btn.component';
import { UploadContainerComponent } from './components/upload-container/upload-container.component';
import { CORE_INITIALIZER } from './core-initialiser';
import { ArtefactDetailsDirective } from './directives/artefact-details.directive';
import { CapsLockDirective } from './directives/caps-lock.directive';
import { TooltipImmediateCloseDirective } from './directives/tooltip-immediate-close.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { StepBasicsModule } from './modules/basics/step-basics.module';
import { CustomRegistriesModule } from './modules/custom-registeries/custom-registries.module';
import { EntitiesSelectionModule } from './modules/entities-selection/entities-selection.module';
import { EntityModule } from './modules/entity/entity.module';
import { StepMaterialModule } from './modules/step-material/step-material.module';
import { TableModule } from './modules/table/table.module';
import { TabsModule } from './modules/tabs/tabs.module';
import { TreeModule } from './modules/tree/tree.module';
import { DashboardLinkPipe } from './pipes/dashboard-link.pipe';
import { MatchingAuthenticator } from './pipes/matching-authenticator.pipe';
import { PlanNamePipe } from './pipes/plan-name.pipe';
import { SimpleLineChartDirective } from './directives/simple-line-chart.directive';
import { DynamicFormsModule } from './modules/dynamic-forms/dynamic-forms.module';

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
    ModalWindowComponent,
    IsUsedByListComponent,
    IsUsedByModalComponent,
    FunctionLinkComponent,
    SelectPlanComponent,
    AutorefreshToggleComponent,
    SettingBtnComponent,
    UploadContainerComponent,
    ProgressBarComponent,
    ArtefactDetailsDirective,
    PlanTreeComponent,
    SimpleLineChartDirective,
    EditableActionsComponent,
    EditableLabelComponent,
    EditableTextareaLabelComponent,
    EditableDropdownLabelComponent,
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
    ModalWindowComponent,
    IsUsedByModalComponent,
    SelectPlanComponent,
    PlanTreeComponent,
    ArtefactDetailsDirective,
    AutorefreshToggleComponent,
    SettingBtnComponent,
    UploadContainerComponent,
    ProgressBarComponent,
    SimpleLineChartDirective,
    EditableLabelComponent,
    EditableTextareaLabelComponent,
    EditableDropdownLabelComponent,
    DynamicFormsModule,
  ],
  providers: [
    CORE_INITIALIZER,
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
  ],
})
export class StepCoreModule {}

export * from './angularjs';
export { BaseHttpRequest } from './client/generated/core/BaseHttpRequest';
export { CancelablePromise, CancelError } from './client/generated/core/CancelablePromise';
export { OpenAPI } from './client/generated/core/OpenAPI';
export type { OpenAPIConfig } from './client/generated/core/OpenAPI';
export * from './client/generated/index';
export * from './client/step-client-module';
export { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
export { EditableDropdownLabelComponent } from './components/editable-dropdown-label/editable-dropdown-label.component';
export { EditableLabelComponent } from './components/editable-label/editable-label.component';
export { EditableTextareaLabelComponent } from './components/editable-textarea-label/editable-textarea-label.component';
export { FunctionLinkDialogService } from './components/function-link/function-link-dialog.service';
export { FunctionLinkComponent } from './components/function-link/function-link.component';
export { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';
export { ModalWindowComponent } from './components/modal-window/modal-window.component';
export { PlanLinkComponent } from './components/plan-link/plan-link.component';
export * from './components/plan-tree/plan-tree.component';
export { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
export * from './components/report-node-status/report-node-status.component';
export { SelectPlanComponent } from './components/select-plan/select-plan.component';
export { SettingBtnComponent } from './components/setting-btn/setting-btn.component';
export { UploadContainerComponent } from './components/upload-container/upload-container.component';
export * from './decorators/plugin';
export * from './directives/artefact-details.directive';
export * from './directives/caps-lock.directive';
export * from './directives/tooltip-immediate-close.directive';
export * from './directives/tooltip.directive';
export * from './directives/simple-line-chart.directive';
export * from './domain';
export * from './modules/async-operations/async-operations.module';
export * from './modules/basics/step-basics.module';
export * from './modules/custom-registeries/custom-registries.module';
export * from './modules/entities-selection/entities-selection.module';
export * from './modules/entity/entity.module';
export * from './modules/step-icons/step-icons.module';
export * from './modules/step-material/step-material.module';
export * from './modules/table/table.module';
export * from './modules/tabs/tabs.module';
export * from './modules/tree/tree.module';
export * from './modules/dynamic-forms/dynamic-forms.module';
export * from './pipes/dashboard-link.pipe';
export * from './pipes/matching-authenticator.pipe';
export { PlanNamePipe } from './pipes/plan-name.pipe';
export * from './services/additional-right-rule.service';
export * from './services/dashboard.service';
export * from './services/deferred-link-processor.service';
export { ExportDialogsService } from './services/export-dialogs.service';
export { ImportDialogsService } from './services/import-dialogs.service';
export * from './services/invoke-run.service';
export { IsUsedByDialogService } from './services/is-used-by-dialog.service';
export * from './services/link-processor.service';
export * from './services/plan-artefact-resolver.service';
export { PlanDialogsService } from './services/plan-dialogs.service';
export * from './services/plan-editor.service';
export * from './services/plan-interactive-session.service';
export * from './services/plugin-info-registry.service';
export * from './services/report-node-commons.service';
export * from './services/scheduled-task-dialogs.service';
export { UibModalHelperService, UibModalInstance } from './services/uib-modal-helper.service';
export * from './services/view-registry.service';
export * from './services/view-state.service';
export * from './services/execution-close-handle.service';
export * from './shared';
