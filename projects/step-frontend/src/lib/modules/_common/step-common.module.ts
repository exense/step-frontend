import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';
import { FunctionLinkComponent } from './components/function-link/function-link.component';
import { IsUsedByListComponent } from './components/is-used-by-list/is-used-by-list.component';
import { LoginComponent } from './components/login/login.component';
import { ModalWindowComponent } from './components/modal-window/modal-window.component';
import { PlanLinkComponent } from './components/plan-link/plan-link.component';
import { PlanNameComponent } from './components/plan-name/plan-name.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ArtefactDetailsDirective } from './directives/artefact-details.directive';
import { CustomFormDirective } from './directives/custom-form.directive';
import { JsonViewerDirective } from './directives/json-viewer.directive';
import { PlanExecutionDirective } from './directives/plan-execution.directive';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';
import { MenuFilterPipe } from './pipes/menu-filter.pipe';

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
    MenuFilterPipe,
    ArtefactDetailsDirective,
    CustomFormDirective,
    PlanExecutionDirective,
    PlanNameComponent,
  ],
  exports: [
    AutorefreshToggleComponent,
    StepCoreModule,
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    IsUsedByListComponent,
    PlanLinkComponent,
    FunctionLinkComponent,
    ModalWindowComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    MenuFilterPipe,
    ArtefactDetailsDirective,
    CustomFormDirective,
    PlanExecutionDirective,
    PlanNameComponent,
  ],
  imports: [StepCoreModule],
})
export class StepCommonModule {}

export * from './shared/status.enum';
