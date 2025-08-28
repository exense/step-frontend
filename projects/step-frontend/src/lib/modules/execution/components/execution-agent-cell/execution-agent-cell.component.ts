import { Component, computed, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgentsModalComponent } from '../execution-agent-modal/execution-agent-modal.component';

@Component({
  selector: 'step-agents-cell',
  templateUrl: './execution-agent-cell.component.html',
  standalone: false,
})
export class AgentsCellComponent {
  private _dialog = inject(MatDialog);

  readonly agentsString = input('', { alias: 'agents' });
  readonly description = input('Agents');

  private agents = computed(() => (this.agentsString() ?? '').split(' ').filter((agent) => agent.trim() !== ''));

  protected agentsCount = computed(() => this.agents().length);

  protected openModal(event: Event) {
    event.preventDefault();
    this._dialog.open(AgentsModalComponent, {
      data: {
        agents: this.agents(),
        description: this.description(),
      },
    });
  }
}
