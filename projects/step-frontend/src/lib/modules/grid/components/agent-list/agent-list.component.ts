import { Component, inject, signal } from '@angular/core';
import {
  AgentListEntry,
  GridService,
  STORE_ALL,
  TableFetchLocalDataSource,
  TableIndicatorMode,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { finalize, Observable } from 'rxjs';
import { TokenTypeComponent } from '../token-type/token-type.component';

type AgentAction = 'INTERRUPT' | 'RESUME' | 'REMOVE_ERRORS';

@Component({
  selector: 'step-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss'],
  providers: [tablePersistenceConfigProvider('agentList', STORE_ALL)],
  standalone: false,
})
export class AgentListComponent {
  private _gridService = inject(GridService);

  protected readonly busyActionByAgentId = signal<Record<string, AgentAction>>({});

  readonly searchableAgent = new TableFetchLocalDataSource(
    () => this._gridService.getAgents(true.toString()),
    TableFetchLocalDataSource.configBuilder<AgentListEntry>()
      .addSearchStringPredicate('url', (item) => item.agentRef!.agentUrl!)
      .addSearchStringPredicate('type', (item) => TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[item.agentRef!.agentType!])
      .addSortStringPredicate('url', (item) => item.agentRef!.agentUrl!)
      .addSortStringPredicate('type', (item) => TokenTypeComponent.TYPE_LABEL_TRANSLATIONS[item.agentRef!.agentType!])
      .build(),
  );

  protected loadTable(): void {
    this.searchableAgent.reload();
  }

  protected interrupt(id: string): void {
    this.runAgentAction(id, 'INTERRUPT', this._gridService.interruptAgent(id));
  }

  protected resume(id: string): void {
    this.runAgentAction(id, 'RESUME', this._gridService.resumeAgent(id));
  }

  protected removeTokenErrors(id: string): void {
    this.runAgentAction(id, 'REMOVE_ERRORS', this._gridService.removeAgentTokenErrors(id));
  }

  private runAgentAction(id: string, action: AgentAction, request$: Observable<unknown>): void {
    if (this.busyActionByAgentId()[id]) {
      return;
    }

    this.busyActionByAgentId.update((actions) => ({ ...actions, [id]: action }));
    request$
      .pipe(
        finalize(() => {
          this.busyActionByAgentId.update(({ [id]: _, ...actions }) => actions);
        }),
      )
      .subscribe(() => this.loadTable());
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
