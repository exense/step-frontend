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
  constructor(_entityRegistry: EntityRegistry, private _viewRegistry: ViewRegistryService) {
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
        component: ScreenConfigurationListComponent,
        children: [
          {
            path: 'editor',
            component: SimpleOutletComponent,
            children: [
              dialogRoute({
                path: 'new/:screenId',
                dialogComponent: ScreenInputEditDialogComponent,
                resolve: {
                  screenInput: (route: ActivatedRouteSnapshot) => {
                    const screenId = route.params['screenId'];
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
      {
        parentPath,
        label: 'Screens',
        accessPermissions: ['settings-ui-menu', 'admin-ui-menu'],
      }
    );

    this._viewRegistry.registerRoute(
      {
        path: 'myaccount',
        component: MyAccountComponent,
      },
      {
        parentPath,
        label: 'My Account',
      }
    );
  }
}
