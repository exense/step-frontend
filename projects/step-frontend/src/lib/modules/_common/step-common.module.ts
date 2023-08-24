import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { DashletRegistryService, EntityColumnComponent, LOGOUT_CLEANUP, StepCoreModule } from '@exense/step-core';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { VersionsDialogComponent } from './components/versions-dialog/versions-dialog.component';
import { JsonViewerDirective } from './directives/json-viewer.directive';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { ContainsVersionPipe } from './pipes/contains-version.pipe';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';
import { MenuFilterPipe } from './pipes/menu-filter.pipe';
import { MenuStorageService } from './injectables/menu-storage.service';
import { SidebarStateService } from './injectables/sidebar-state.service';

@NgModule({
  declarations: [
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
    ContainsVersionPipe,
    MenuFilterPipe,
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: LOGOUT_CLEANUP,
      useExisting: MenuStorageService,
      multi: true,
    },
    {
      provide: LOGOUT_CLEANUP,
      useExisting: SidebarStateService,
      multi: true,
    },
  ],
})
export class StepCommonModule {
  constructor(dashletRegistryService: DashletRegistryService) {
    dashletRegistryService.registerDashlet('entityColumn', EntityColumnComponent);
  }
}

export * from './shared/status.enum';
