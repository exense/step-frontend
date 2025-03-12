import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgentsModalComponent } from '../execution-agent-modal/execution-agent-modal.component';

@Component({
  selector: 'step-agents-cell',
  templateUrl: './execution-agent-cell.component.html',
})
export class AgentsCellComponent {
  readonly agents = input('');
  readonly description = input('Agents');

  protected agentsArray = computed(() => (this.agents() ?? '').split(' ').filter((agent) => agent.trim() !== ''));

  private _dialog = inject(MatDialog);

  protected openModal(event: Event) {
    event.preventDefault();
    this._dialog.open(AgentsModalComponent, {
      data: {
        agents: this.agentsArray(),
        description: this.description(),
      },
    });
  }
}
