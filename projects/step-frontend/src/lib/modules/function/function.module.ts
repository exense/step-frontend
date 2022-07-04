import { NgModule } from '@angular/core';
import { StepBasicsModule, StepCoreModule } from '@exense/step-core';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { FunctionPackageLinkComponent } from './components/function-package-link/function-package-link';

@NgModule({
  declarations: [FunctionListComponent, FunctionPackageLinkComponent],
  imports: [StepCommonModule, StepCoreModule, StepBasicsModule],
  exports: [FunctionListComponent, FunctionPackageLinkComponent],
})
export class FunctionModule {}
