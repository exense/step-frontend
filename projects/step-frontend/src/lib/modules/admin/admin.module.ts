import { NgModule } from '@angular/core';
import { CustomCellRegistryService, EntityRegistry, StepCoreModule } from '@exense/step-core';
import { StepCommonModule } from '../_common/step-common.module';
import { EditUserDialogComponent } from './components/edit-user-dialog/edit-user-dialog.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { ScreenConfigurationListComponent } from './components/screen-configuration-list/screen-configuration-list.component';
import { UsersListComponent } from './components/users-list/users-list.component';

@NgModule({
  declarations: [MyAccountComponent, UsersListComponent, ScreenConfigurationListComponent, EditUserDialogComponent],
  exports: [MyAccountComponent, UsersListComponent, ScreenConfigurationListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class AdminModule {
  constructor(_entityRegistry: EntityRegistry, _cellRegistry: CustomCellRegistryService) {
    _entityRegistry.register('users', 'User', 'user', '/partials/users/userSelectionTable.html');
  }
}
