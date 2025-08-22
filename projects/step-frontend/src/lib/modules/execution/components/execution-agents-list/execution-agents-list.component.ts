import { Component, input } from '@angular/core';
import {
  STORE_ALL,
  TableMemoryStorageService,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
  TableStorageService,
} from '@exense/step-core';

@Component({
  selector: 'step-execution-agents-list',
  templateUrl: './execution-agents-list.component.html',
  styleUrl: './execution-agents-list.component.scss',
  providers: [
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('executionAgentsList', STORE_ALL),
  ],
  standalone: false,
})
export class ExecutionAgentsListComponent {
  readonly agents = input([], {
    transform: (agentsArrayOrString?: string | string[]) => {
      if (agentsArrayOrString instanceof Array) {
        return agentsArrayOrString;
      }
      return (agentsArrayOrString ?? '').split(' ').filter((agent) => agent.trim() !== '');
    },
  });
}
