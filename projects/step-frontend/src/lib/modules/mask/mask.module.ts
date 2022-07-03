import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { MaskListComponent } from './components/mask-list/mask-list.component';
import { StepCommonModule } from '../_common/step-common.module';

@NgModule({
  declarations: [MaskListComponent],
  imports: [StepCommonModule, StepCoreModule],
  exports: [MaskListComponent],
})
export class MaskModule {}
