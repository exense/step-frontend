import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { StepCoreModule } from '@exense/step-core';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { TokenStateProgressbarComponent } from './components/token-state-progressbar/token-state-progressbar.component';
import { TokenListComponent } from './components/token-list/token-list.component';
import { CalcStatusSummaryProgressbarPercentPipe } from './components/token-state-progressbar/calc-status-summary-progressbar-with-percent.pipe';
import { FlatObjectStringFormatPipe } from './services/flat-object-format.pipe';
import { AddPrefixPipe } from './components/token-type/add-prefix.pipe';
import { TokenTypeComponent } from './components/token-type/token-type.component';
import { TokenStateComponent } from './components/token-state/token-state.component';

@NgModule({
  declarations: [
    AgentListComponent,
    TokenListComponent,
    TokenStateProgressbarComponent,
    TokenTypeComponent,
    TokenStateComponent,
    CalcStatusSummaryProgressbarPercentPipe,
    FlatObjectStringFormatPipe,
    AddPrefixPipe,
  ],
  exports: [AgentListComponent, TokenListComponent, TokenStateProgressbarComponent],
  imports: [StepCoreModule, StepCommonModule],
})
export class GridModule {}
