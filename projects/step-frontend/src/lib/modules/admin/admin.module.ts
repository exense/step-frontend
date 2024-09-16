import { inject, NgModule } from '@angular/core';
import {
  AugmentedScreenService,
  dialogRoute,
  EntityRegistry,
  ScreenInput,
  SettingsComponent,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
  AuthService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { ScreenConfigurationListComponent } from './components/screen-configuration-list/screen-configuration-list.component';
import { ScreenInputEditDialogComponent } from './components/screen-input-edit-dialog/screen-input-edit-dialog.component';
import { ScreenInputDropdownOptionsComponent } from './components/screen-input-dropdown-options/screen-input-dropdown-options.component';
import { RenderOptionsPipe } from './pipes/render-options.pipe';
import { UserSelectionComponent } from './components/user-selection/user-selection.component';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { CURRENT_SCREEN_CHOICE_DEFAULT } from './types/constants';
import { first, map } from 'rxjs';

@NgModule({
  declarations: [
    MyAccountComponent,
    ScreenConfigurationListComponent,
    ScreenInputEditDialogComponent,
    ScreenInputDropdownOptionsComponent,
    RenderOptionsPipe,
    UserSelectionComponent,
  ],
  exports: [
    MyAccountComponent,
    ScreenConfigurationListComponent,
    ScreenInputEditDialogComponent,
    UserSelectionComponent,
  ],
  imports: [StepCoreModule, StepCommonModule],
  providers: [RenderOptionsPipe],
})
export class AdminModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _viewRegistry: ViewRegistryService,
    private _auth: AuthService,
  ) {
    this.registerEntities();
    this.registerMenuEntries();
    this.registerCommonSettingsRoutes();
    this.registerAdminSettingsRoutes();
  }

  private registerEntities(): void {
    this._entityRegistry.register('users', 'User', { icon: 'user', component: UserSelectionComponent });
  }

  private registerCommonSettingsRoutes(): void {
    this._viewRegistry.registerRoute({
      path: 'settings',
      component: SettingsComponent,
      data: {
        resolveChildFor: 'settings',
      },
    });

    this._viewRegistry.registerRoute(
      {
        path: 'my-account',
        component: MyAccountComponent,
      },
      {
        parentPath: 'settings',
        label: 'User Settings',
      },
    );

    this._viewRegistry.registerRoute(
      {
        path: 'screens',
        component: SimpleOutletComponent,
        children: [
          {
            path: '',
            redirectTo: CURRENT_SCREEN_CHOICE_DEFAULT,
          },
          {
            path: ':screenId',
            component: ScreenConfigurationListComponent,
            resolve: {
              availableScreens: () => inject(AugmentedScreenService).getScreens(),
            },
            children: [
              {
                path: 'editor',
                component: SimpleOutletComponent,
                children: [
                  dialogRoute({
                    path: 'new',
                    dialogComponent: ScreenInputEditDialogComponent,
                    resolve: {
                      screenInput: (route: ActivatedRouteSnapshot) => {
                        const screenId = route.parent!.parent!.params['screenId'];
                        return {
                          screenId,
                          input: { type: 'TEXT' },
                        } as ScreenInput;
                      },
                    },
                  }),
                  dialogRoute({
                    path: ':id',
                    dialogComponent: ScreenInputEditDialogComponent,
                    resolve: {
                      screenInput: (route: ActivatedRouteSnapshot) =>
                        inject(AugmentedScreenService).getInput(route.params['id']),
                    },
                  }),
                ],
              },
            ],
          },
        ],
      },
      {
        parentPath: 'settings',
        label: 'Screens',
        accessPermissions: ['settings-ui-menu', 'admin-ui-menu'],
      },
    );
  }

  private registerAdminSettingsRoutes(): void {
    this._viewRegistry.registerRoute({
      path: 'admin',
      component: SimpleOutletComponent,
      canActivate: [
        () => {
          const _authService = inject(AuthService);
          const _router = inject(Router);
          return _authService.initialize$.pipe(
            first(),
            map(() => {
              if (_authService.hasRight('admin-ui-menu')) {
                return true;
              }
              return _router.parseUrl('/');
            }),
          );
        },
      ],
      children: [
        {
          path: '',
          redirectTo: 'controller',
        },
        {
          path: 'controller',
          component: SettingsComponent,
          data: {
            resolveChildFor: 'admin/controller',
          },
        },
      ],
    });
  }

  private registerMenuEntries(): void {
    this._viewRegistry.registerMenuEntry('Admin Settings', 'admin', 'settings', {
      weight: 90,
      isEnabledFct: () => this._auth.hasRight('admin-ui-menu'),
    });
  }
}
