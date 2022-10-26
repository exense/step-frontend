import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';
import { JsonViewerDirective } from './directives/json-viewer.directive';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';
import { MenuFilterPipe } from './pipes/menu-filter.pipe';
import { ArtefactDetailsDirective } from './directives/artefact-details.directive';
import { CustomFormDirective } from './directives/custom-form.directive';
import { PlanExecutionDirective } from './directives/plan-execution.directive';

@NgModule({
  declarations: [
    AutorefreshToggleComponent,
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    MenuFilterPipe,
    ArtefactDetailsDirective,
    CustomFormDirective,
    PlanExecutionDirective,
  ],
  exports: [
    AutorefreshToggleComponent,
    StepCoreModule,
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    MenuFilterPipe,
    ArtefactDetailsDirective,
    CustomFormDirective,
    PlanExecutionDirective,
  ],
  imports: [StepCoreModule],
})
export class StepCommonModule {}

export * from './shared/status.enum';
