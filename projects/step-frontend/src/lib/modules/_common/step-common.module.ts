import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { VersionsDialogComponent } from './components/versions-dialog/versions-dialog.component';
import { CustomFormDirective } from './directives/custom-form.directive';
import { JsonViewerDirective } from './directives/json-viewer.directive';
import { PlanExecutionDirective } from './directives/plan-execution.directive';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { ContainsVersionPipe } from './pipes/contains-version.pipe';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';
import { MenuFilterPipe } from './pipes/menu-filter.pipe';

@NgModule({
  declarations: [
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    ContainsVersionPipe,
    MenuFilterPipe,
    CustomFormDirective,
    PlanExecutionDirective,
    VersionsDialogComponent,
  ],
  exports: [
    StepCoreModule,
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    ContainsVersionPipe,
    MenuFilterPipe,
    CustomFormDirective,
    PlanExecutionDirective,
  ],
  imports: [StepCoreModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
  ],
})
export class StepCommonModule {}

export * from './shared/status.enum';
