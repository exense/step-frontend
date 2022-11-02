import { NgModule } from '@angular/core';
import { AuthService, StepCoreModule } from '@exense/step-core';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';
import { JsonViewerDirective } from './directives/json-viewer.directive';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';
import { MenuFilterPipe } from './pipes/menu-filter.pipe';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AutorefreshToggleComponent,
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    MenuFilterPipe,
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
  ],
  imports: [StepCoreModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
})
export class StepCommonModule {}

export * from './shared/status.enum';
