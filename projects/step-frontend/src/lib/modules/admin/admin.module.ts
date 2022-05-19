import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StepCoreModule } from '@exense/step-core';
import { MyAccountComponent } from './components/my-account/my-account.component';

@NgModule({
  declarations: [MyAccountComponent],
  exports: [MyAccountComponent],
  imports: [StepCoreModule, RouterModule],
})
export class AdminModule {}
