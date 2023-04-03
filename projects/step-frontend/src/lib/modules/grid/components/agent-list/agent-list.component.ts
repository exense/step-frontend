import { Component } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, GridService, TableFetchLocalDataSource } from '@exense/step-core';
import { TokenTypeComponent } from '../token-type/token-type.component';

@Component({
  selector: 'step-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss'],
})
export class AgentListComponent {
  readonly searchableAgent = new TableFetchLocalDataSource(() => this._gridService.getAgents(true.toString()), {
    searchPredicates: {
      url: (element, searchValue) => element.agentRef!['agentUrl']!.toLowerCase().includes(searchValue.toLowerCase()),
      type: (element, searchValue) =>
        TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[element.agentRef!.agentType!]!.toLowerCase().includes(
          searchValue.toLowerCase()
        ),
    },
    sortPredicates: {
      url: (elementA, elementB) => elementA.agentRef!['agentUrl']!.localeCompare(elementB!.agentRef!['agentUrl']!),
      type: (elementA, elementB) =>
        TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[elementA.agentRef!.agentType!]!.localeCompare(
          TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[elementB.agentRef!.agentType!]!
        ),
    },
  });

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
