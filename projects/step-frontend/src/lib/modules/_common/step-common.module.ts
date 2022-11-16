import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';

import { JsonViewerDirective } from './directives/json-viewer.directive';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';
import { MenuFilterPipe } from './pipes/menu-filter.pipe';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { IsUsedByListComponent } from './components/is-used-by-list/is-used-by-list.component';

import { FunctionLinkComponent } from './components/function-link/function-link.component';
import { LoginComponent } from './components/login/login.component';
import { ModalWindowComponent } from './components/modal-window/modal-window.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
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
    FunctionLinkComponent,
    ModalWindowComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
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
    IsUsedByListComponent,
    FunctionLinkComponent,
    ModalWindowComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    MenuFilterPipe,
    ArtefactDetailsDirective,
    CustomFormDirective,
    PlanExecutionDirective,
    IsUsedByModalComponent,
  ],
  imports: [StepCoreModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
})
export class StepCommonModule {}

export * from './shared/status.enum';
export * from './shared/is-used-by-search-type';
export * from './services/is-used-by-dialog.service';
export * from './components/function-link/function-link-dialog.service';
