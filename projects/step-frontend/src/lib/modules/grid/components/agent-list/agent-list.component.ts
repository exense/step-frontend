import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AgentListEntry, AJS_MODULE, GridService, TableFetchLocalDataSource } from '@exense/step-core';
import { TokenTypeComponent } from '../token-type/token-type.component';

@Component({
  selector: 'step-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss'],
})
export class AgentListComponent {
  readonly searchableAgent = new TableFetchLocalDataSource(
    () => this._gridService.getAgents(true.toString()),
    TableFetchLocalDataSource.configBuilder<AgentListEntry>()
      .addSearchStringPredicate('url', (item) => item.agentRef!.agentUrl!)
      .addSearchStringPredicate('type', (item) => TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[item.agentRef!.agentType!])
      .addSortStringPredicate('url', (item) => item.agentRef!.agentUrl!)
      .addSortStringPredicate('type', (item) => TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[item.agentRef!.agentType!])
      .build()
  );

  constructor(private _gridService: GridService) {}

  loadTable(): void {
    this.searchableAgent.reload();
  }

  interrupt(id: string): void {
    this._gridService.interruptAgent(id).subscribe(() => {
      this.loadTable();
    });
  }

  resume(id: string): void {
    this._gridService.resumeAgent(id).subscribe(() => {
      this.loadTable();
    });
  }

  removeTokenErrors(id: string): void {
    this._gridService.removeAgentTokenErrors(id).subscribe(() => {
      this.loadTable();
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepAgentList', downgradeComponent({ component: AgentListComponent }));
