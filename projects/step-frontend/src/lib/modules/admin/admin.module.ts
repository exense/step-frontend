import { inject, NgModule } from '@angular/core';
import {
  AugmentedScreenService,
  dialogRoute,
  EntityRegistry,
  ScreenInput,
  SimpleOutletComponent,
  StepCoreModule,
  ViewRegistryService,
  AuthService,
  InfoBannerService,
  EntityRefDirective,
  checkEntityGuardFactory,
  MultipleProjectsService,
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { ScreenConfigurationListComponent } from './components/screen-configuration-list/screen-configuration-list.component';
import { ScreenInputEditDialogComponent } from './components/screen-input-edit-dialog/screen-input-edit-dialog.component';
import { ScreenInputDropdownOptionsComponent } from './components/screen-input-dropdown-options/screen-input-dropdown-options.component';
import { RenderOptionsPipe } from './pipes/render-options.pipe';
import { UserSelectionComponent } from './components/user-selection/user-selection.component';
import { ActivatedRouteSnapshot, Router, RouterLinkActive } from '@angular/router';
import { CURRENT_SCREEN_CHOICE_DEFAULT } from './types/constants';
import { first, map } from 'rxjs';
import { ProjectSettingsMenuComponent } from './components/project-settings-menu/project-settings-menu.component';
import { MatListItem, MatNavList } from '@angular/material/list';
import { AdminSettingsMenuComponent } from './components/admin-settings-menu/admin-settings-menu.component';

const REGEXP_EDITOR_URL = /\/settings\/\/screens\/\w+\/editor\/(?:\d|\w){24}/;

@NgModule({
  declarations: [
    UserSettingsComponent,
    ScreenConfigurationListComponent,
    ScreenInputEditDialogComponent,
    ScreenInputDropdownOptionsComponent,
    RenderOptionsPipe,
    UserSelectionComponent,
    ProjectSettingsMenuComponent,
    AdminSettingsMenuComponent,
  ],
  exports: [
    UserSettingsComponent,
    ScreenConfigurationListComponent,
    ScreenInputEditDialogComponent,
    UserSelectionComponent,
    ProjectSettingsMenuComponent,
    AdminSettingsMenuComponent,
  ],
  imports: [StepCoreModule, StepCommonModule, MatListItem, MatNavList, RouterLinkActive, EntityRefDirective],
  providers: [RenderOptionsPipe],
})
export class AdminModule {
  constructor(
    private _entityRegistry: EntityRegistry,
    private _viewRegistry: ViewRegistryService,
    private _auth: AuthService,
    private _infoBanner: InfoBannerService,
  ) {
    this.registerEntities();
    this.registerMenuEntries();
    this.registerUserSettings();
    this.registerProjectSettingsRoutes();
    this.registerAdminSettingsRoutes();
    this.registerInfoBanners();
  }

  private registerEntities(): void {
    this._entityRegistry.register('users', 'User', { icon: 'user', component: UserSelectionComponent });
  }

  private registerUserSettings(): void {
    this._viewRegistry.registerRoute({
      path: 'user-settings',
      component: UserSettingsComponent,
    });
  }

  private registerProjectSettingsRoutes(): void {
    this._viewRegistry.registerRoute({
      path: 'settings',
      component: ProjectSettingsMenuComponent,
      data: {
        resolveChildFor: 'settings',
      },
    });

    // For some reason, when 'screens' route appears it first
    // it brakes the relative navigation in SettingsComponent
    // to avoid it, additional route is set, which redirects to screens
    // redirection has done through 'canActivate', because `redirectTo` didn't give required effect
    this._viewRegistry.registerRoute(
      {
        path: 'settings-init',
        canActivate: [() => inject(Router).parseUrl('/settings/screens')],
      },
      {
        parentPath: 'settings',
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
                    canActivate: [
                      checkEntityGuardFactory({
                        entityType: 'screenInputs',
                        getEntity: (id) => inject(AugmentedScreenService).getInputCached(id),
                        getEditorUrl: (id, route) => {
                          const screenId = route.parent!.parent!.params['screenId'];
                          return `/settings/screens/${screenId}/editor/${id}`;
                        },
                        isMatchEditorUrl: (url) => REGEXP_EDITOR_URL.test(url),
                        getListUrl: () => '/settings/screens',
                      }),
                    ],
                    resolve: {
                      screenInput: (route: ActivatedRouteSnapshot) => {
                        return inject(AugmentedScreenService).getInputCached(route.params['id']);
                      },
                    },
                    canDeactivate: [
                      () => {
                        inject(AugmentedScreenService).clearCachedScreenInput();
                        inject(MultipleProjectsService).currentProject();
                        return true;
                      },
                    ],
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
        weight: 10,
      },
    );

    this._viewRegistry.registerRoute(
      {
        path: 'my-account',
        canActivate: [() => inject(Router).parseUrl('/user-settings')],
      },
      { parentPath: 'settings' },
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
          component: AdminSettingsMenuComponent,
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

  private registerInfoBanners(): void {}
}
