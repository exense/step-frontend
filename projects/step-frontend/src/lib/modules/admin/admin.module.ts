import { NgModule } from '@angular/core';
import { DashletRegistryService, EntityRegistry, SettingButtonComponent, StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { ScreenConfigurationListComponent } from './components/screen-configuration-list/screen-configuration-list.component';
import { ScreenInputEditDialogComponent } from './components/screen-input-edit-dialog/screen-input-edit-dialog.component';
import { ScreenInputDropdownOptionsComponent } from './components/screen-input-dropdown-options/screen-input-dropdown-options.component';
import { RenderOptionsPipe } from './pipes/render-options.pipe';

@NgModule({
  declarations: [
    MyAccountComponent,
    ScreenConfigurationListComponent,
    ScreenInputEditDialogComponent,
    ScreenInputDropdownOptionsComponent,
    RenderOptionsPipe,
  ],
  exports: [MyAccountComponent, ScreenConfigurationListComponent, ScreenInputEditDialogComponent],
  imports: [StepCoreModule, StepCommonModule],
  providers: [RenderOptionsPipe],
})
export class AdminModule {
  constructor(_entityRegistry: EntityRegistry, _dashletRegistry: DashletRegistryService) {
    _entityRegistry.register('users', 'User', { icon: 'user', templateUrl: 'partials/users/userSelectionTable.html' });
    _dashletRegistry.registerDashlet('settings-button', SettingButtonComponent);
  }
}
