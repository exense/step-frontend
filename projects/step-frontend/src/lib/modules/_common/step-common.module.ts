import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';
import { JsonViewerDirective } from './directives/json-viewer.directive';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';
import { ContainsVersionPipe } from './pipes/contains-version.pipe';
import { MenuFilterPipe } from './pipes/menu-filter.pipe';
import { IsUsedByListComponent } from './components/is-used-by-list/is-used-by-list.component';
import { PlanLinkComponent } from './components/plan-link/plan-link.component';
import { FunctionLinkComponent } from './components/function-link/function-link.component';
import { ModalWindowComponent } from './components/modal-window/modal-window.component';
import { ArtefactDetailsDirective } from './directives/artefact-details.directive';
import { CustomFormDirective } from './directives/custom-form.directive';
import { PlanExecutionDirective } from './directives/plan-execution.directive';
import { VersionsDialogComponent } from './components/versions-dialog/versions-dialog.component';
import { IsUsedByModalComponent } from './components/is-used-by-modal/is-used-by-modal.component';

@NgModule({
  declarations: [
    AutorefreshToggleComponent,
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    IsUsedByListComponent,
    PlanLinkComponent,
    FunctionLinkComponent,
    ModalWindowComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    ContainsVersionPipe,
    MenuFilterPipe,
    ArtefactDetailsDirective,
    CustomFormDirective,
    PlanExecutionDirective,
    VersionsDialogComponent,
    IsUsedByModalComponent,
  ],
  exports: [
    AutorefreshToggleComponent,
    StepCoreModule,
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    PlanLinkComponent,
    FunctionLinkComponent,
    ModalWindowComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    ContainsVersionPipe,
    MenuFilterPipe,
    ArtefactDetailsDirective,
    CustomFormDirective,
    PlanExecutionDirective,
    IsUsedByModalComponent,
  ],
  imports: [StepCoreModule],
})
export class StepCommonModule {}

export * from './shared/status.enum';
export * from './shared/is-used-by-search-type';
export * from './services/is-used-by-dialog.service';
export * from './components/function-link/function-link-dialog.service';
