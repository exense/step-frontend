import { NgModule } from '@angular/core';
import { BaseModule } from '../base/base.module';
import { MyAccountComponent } from './components/my-account/my-account.component';




@NgModule({
  declarations: [
    MyAccountComponent
  ],
  exports: [
    MyAccountComponent
  ],
  imports: [
    BaseModule
  ]
})
export class AdminModule { }
