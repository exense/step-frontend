import { NgModule } from '@angular/core';
import { GenericFunctionListComponent } from './components/generic-function-list/generic-function-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { FunctionModule } from '../function/function.module';

@NgModule({
  declarations: [GenericFunctionListComponent],
  imports: [StepCommonModule, FunctionModule],
  exports: [GenericFunctionListComponent],
})
export class GenericFunctionModule {}
