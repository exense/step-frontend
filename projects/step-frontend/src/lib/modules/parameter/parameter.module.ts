import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { ParametersListComponent } from './parameters-list/parameters-list.component';

@NgModule({
  declarations: [ParametersListComponent],
  exports: [ParametersListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class ParameterModule {}
