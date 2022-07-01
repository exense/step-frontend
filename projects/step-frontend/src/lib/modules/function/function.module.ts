import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { StepCommonModule } from '../_common/step-common.module';

@NgModule({
  declarations: [FunctionListComponent],
  imports: [StepCommonModule, StepCoreModule],
  exports: [FunctionListComponent],
})
export class FunctionModule {}
