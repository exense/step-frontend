import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { MonitoringListComponent } from './monitoring-list/monitoring-list.component';

@NgModule({
  declarations: [MonitoringListComponent],
  exports: [MonitoringListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class MonitoringModule {}
