import { NgModule } from '@angular/core';
import { StepCommonModule } from '../_common/step-common.module';
import { EntityRefDirective, StepCoreModule, ViewRegistryService } from '@exense/step-core';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { TokenStateProgressbarComponent } from './components/token-state-progressbar/token-state-progressbar.component';
import { TokenListComponent } from './components/token-list/token-list.component';
import { CalcStatusSummaryProgressbarPercentPipe } from './components/token-state-progressbar/calc-status-summary-progressbar-with-percent.pipe';
import { FlatObjectStringFormatPipe } from './pipes/flat-object-format.pipe';
import { AddPrefixPipe } from './components/token-type/add-prefix.pipe';
import { TokenTypeComponent } from './components/token-type/token-type.component';
import { TokenStateComponent } from './components/token-state/token-state.component';
import { TokenGroupListComponent } from './components/token-group-list/token-group-list.component';
import { QuotaManagerComponent } from './components/quota-manager/quota-manager.component';

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
    TokenGroupListComponent,
    QuotaManagerComponent,
  ],
  exports: [
    AgentListComponent,
    TokenListComponent,
    TokenGroupListComponent,
    TokenStateProgressbarComponent,
    QuotaManagerComponent,
  ],
  imports: [StepCoreModule, StepCommonModule, EntityRefDirective],
})
export class GridModule {
  constructor(private _viewRegistry: ViewRegistryService) {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this._viewRegistry.registerRoute({
      path: 'grid-agents',
      component: AgentListComponent,
    });
    this._viewRegistry.registerRoute({
      path: 'grid-tokens',
      component: TokenListComponent,
    });
    this._viewRegistry.registerRoute({
      path: 'grid-token-groups',
      component: TokenGroupListComponent,
    });
    this._viewRegistry.registerRoute({
      path: 'grid-quota-manager',
      component: QuotaManagerComponent,
    });
  }
}
