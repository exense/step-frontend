import { NgModule } from '@angular/core';
import { DashletRegistryService, EntityRegistry, SettingButtonComponent, StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { ScreenConfigurationListComponent } from './components/screen-configuration-list/screen-configuration-list.component';

@NgModule({
  declarations: [MyAccountComponent, ScreenConfigurationListComponent],
  exports: [MyAccountComponent, ScreenConfigurationListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class AdminModule {
  constructor(_entityRegistry: EntityRegistry, _dashletRegistry: DashletRegistryService) {
    _entityRegistry.register('users', 'User', 'user', '/partials/users/userSelectionTable.html');
    _dashletRegistry.registerDashlet('settings-button', SettingButtonComponent);
  }
}
