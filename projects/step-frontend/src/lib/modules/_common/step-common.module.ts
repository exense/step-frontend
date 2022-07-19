import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { ArrayFilterComponent } from './components/array-filter/array-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  declarations: [AutorefreshToggleComponent, ArrayFilterComponent, DateFilterComponent, LoginComponent],
  exports: [AutorefreshToggleComponent, ArrayFilterComponent, DateFilterComponent, StepCoreModule, LoginComponent],
  imports: [StepCoreModule],
})
export class StepCommonModule {}
