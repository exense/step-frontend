import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { StepCommonModule } from '../_common/step-common.module';

@NgModule({
  declarations: [MyAccountComponent, UsersListComponent],
  exports: [MyAccountComponent, UsersListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class AdminModule {}
