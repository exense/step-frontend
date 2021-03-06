import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { GenericFunctionListComponent } from './components/generic-function-list/generic-function-list.component';
import { StepCommonModule } from '../_common/step-common.module';

@NgModule({
  declarations: [GenericFunctionListComponent],
  imports: [StepCommonModule, StepCoreModule],
  exports: [GenericFunctionListComponent],
})
export class GenericFunctionModule {}
