import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { ArrayFilterComponent } from './components/array-filter/array-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';

@NgModule({
  declarations: [AutorefreshToggleComponent, ArrayFilterComponent, DateFilterComponent, ExecutionLinkComponent],
  exports: [
    AutorefreshToggleComponent,
    ArrayFilterComponent,
    DateFilterComponent,
    StepCoreModule,
    ExecutionLinkComponent,
  ],
  imports: [StepCoreModule],
})
export class StepCommonModule {}
