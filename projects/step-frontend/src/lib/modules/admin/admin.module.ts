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
} from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { ScreenConfigurationListComponent } from './components/screen-configuration-list/screen-configuration-list.component';
import { ScreenInputEditDialogComponent } from './components/screen-input-edit-dialog/screen-input-edit-dialog.component';
import { ScreenInputDropdownOptionsComponent } from './components/screen-input-dropdown-options/screen-input-dropdown-options.component';
import { RenderOptionsPipe } from './pipes/render-options.pipe';
import { UserSelectionComponent } from './components/user-selection/user-selection.component';
import { ActivatedRouteSnapshot } from '@angular/router';
import { CURRENT_SCREEN_CHOICE_DEFAULT } from './types/constants';
import { CurrentUserAvatarComponent } from './components/current-user-avatar/current-user-avatar.component';
import { AvatarEditorComponent } from './components/avatar-editor/avatar-editor.component';
import { UserAvatarComponent } from './components/user-avatar/user-avatar.component';

@NgModule({
  declarations: [
    MyAccountComponent,
    ScreenConfigurationListComponent,
    ScreenInputEditDialogComponent,
    ScreenInputDropdownOptionsComponent,
    RenderOptionsPipe,
    UserSelectionComponent,
    CurrentUserAvatarComponent,
    UserAvatarComponent,
    AvatarEditorComponent,
  ],
  exports: [
    MyAccountComponent,
    ScreenConfigurationListComponent,
    ScreenInputEditDialogComponent,
    UserSelectionComponent,
    AvatarEditorComponent,
    CurrentUserAvatarComponent,
    UserAvatarComponent,
  ],
  imports: [StepCoreModule, StepCommonModule],
  providers: [RenderOptionsPipe],
})
export class AdminModule {
  constructor(
    _entityRegistry: EntityRegistry,
    private _viewRegistry: ViewRegistryService,
  ) {
    _entityRegistry.register('users', 'User', { icon: 'user', component: UserSelectionComponent });

    this.registerSettingsSubRoutes('settings');
    this.registerSettingsSubRoutes('admin/controller');

    _viewRegistry.registerRoute({
      path: 'settings',
      component: SettingsComponent,
      data: {
        resolveChildFor: 'settings',
      },
    });
  }

  private registerSettingsSubRoutes(parentPath: string): void {
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
        parentPath,
        label: 'Screens',
        accessPermissions: ['settings-ui-menu', 'admin-ui-menu'],
      },
    );

    this._viewRegistry.registerRoute(
      {
        path: 'my-account',
        component: MyAccountComponent,
      },
      {
        parentPath,
        label: 'My Account',
      },
    );
  }
}

export * from './injectables/user-state.service';
