import { NgModule } from '@angular/core';
import { StepCoreModule } from '@exense/step-core';
import { AutorefreshToggleComponent } from './components/autorefresh-toggle/autorefresh-toggle.component';
import { ArrayFilterComponent } from './components/array-filter/array-filter.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { LoginComponent } from './components/login/login.component';
import { ExecutionLinkComponent } from './components/execution-link/execution-link.component';
import { JsonViewerDirective } from './directives/json-viewer.directive';
import { IsEmptyJsonPipe } from './pipes/is-empty-json.pipe';

@NgModule({
  declarations: [
    AutorefreshToggleComponent,
    ArrayFilterComponent,
    DateFilterComponent,
    LoginComponent,
    ExecutionLinkComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
  ],
  exports: [
    AutorefreshToggleComponent,
    ArrayFilterComponent,
    DateFilterComponent,
    StepCoreModule,
    LoginComponent,
    ExecutionLinkComponent,
    JsonViewerDirective,
    IsEmptyJsonPipe,
  ],
  imports: [StepCoreModule],
})
export class StepCommonModule {}
