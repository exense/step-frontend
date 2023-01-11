import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { ResourcesListComponent } from './resources-list/resources-list.component';

@NgModule({
  declarations: [ResourcesListComponent],
  exports: [ResourcesListComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class ContextMenuModule {}

export * from './services/resource-dialogs.service';
