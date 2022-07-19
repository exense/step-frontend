import { NgModule } from '@angular/core';
import { StepBasicsModule, StepCoreModule } from '@exense/step-core';
import { FunctionListComponent } from './components/function-list/function-list.component';
import { StepCommonModule } from '../_common/step-common.module';
import { FunctionPackageLinkComponent } from './components/function-package-link/function-package-link.component';
import { FunctionPackageListComponent } from './components/function-package-list/function-package-list.component';

@NgModule({
  declarations: [FunctionListComponent, FunctionPackageLinkComponent, FunctionPackageListComponent],
  imports: [StepCommonModule, StepCoreModule, StepBasicsModule],
  exports: [FunctionListComponent, FunctionPackageLinkComponent],
})
export class FunctionModule {}
