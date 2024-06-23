import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, inject, NgModule } from '@angular/core';
import {
  DashletRegistryService,
  EntityColumnComponent,
  LOGOUT_CLEANUP,
  StepCoreModule,
  LockColumnComponent,
  ColumnSettingsSaveDashletComponent,
} from '@exense/step-core';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';
import { LoginComponent } from './components/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { VersionsDialogComponent } from './components/versions-dialog/versions-dialog.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { ContainsVersionPipe } from './pipes/contains-version.pipe';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';
import { MenuFilterPipe } from './pipes/menu-filter.pipe';
import { SidebarStateService } from './injectables/sidebar-state.service';
import { IsMenuItemActivePipe } from './pipes/is-menu-item-active.pipe';
import { ConnectionErrorInterceptor } from './interceptors/connection-error.interceptor';
import { HttpErrorOverrideInterceptor } from './interceptors/http-error-override.interceptor';
import { SideBarClickDirective } from './directives/side-bar-click.directive';

@NgModule({
  declarations: [
    LoginComponent,
    SidebarComponent,
    SideBarClickDirective,
    ExecutionLinkComponent,
    IsEmptyJsonPipe,
    ContainsVersionPipe,
    MenuFilterPipe,
    VersionsDialogComponent,
    IsMenuItemActivePipe,
  ],
  exports: [
    StepCoreModule,
    LoginComponent,
    SidebarComponent,
    ExecutionLinkComponent,
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
      useClass: ConnectionErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorOverrideInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    {
      provide: LOGOUT_CLEANUP,
      useExisting: SidebarStateService,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const dashletRegistryService = inject(DashletRegistryService);
        dashletRegistryService.registerDashlet('entityColumn', EntityColumnComponent);
        dashletRegistryService.registerDashlet('entityLock', LockColumnComponent);
        dashletRegistryService.registerDashlet('columnSettingsSave', ColumnSettingsSaveDashletComponent);
        return () => true;
      },
      multi: true,
    },
  ],
})
export class StepCommonModule {}

export * from './shared/status.enum';
export * from './components/login/login.component';
