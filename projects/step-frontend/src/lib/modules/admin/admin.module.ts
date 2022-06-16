import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { ScreenConfigurationListComponent } from './components/screen-configuration-list/screen-configuration-list.component';

@NgModule({
  declarations: [MyAccountComponent, UsersListComponent, ScreenConfigurationListComponent],
  exports: [MyAccountComponent, UsersListComponent, ScreenConfigurationListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class AdminModule {}
