import { Component, computed, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgentsModalComponent } from '../execution-agent-modal/execution-agent-modal.component';

@Component({
  selector: 'step-agents-cell',
  templateUrl: './execution-agent-cell.component.html',
})
export class AgentsCellComponent {
  agents = input('');
  description = input('Agents');

  protected agentsArray = computed(() =>
    this.agents()
      .split(' ')
      .filter((agent) => agent.trim() !== ''),
  );

  constructor(private dialog: MatDialog) {}

  openModal(event: Event) {
    event.preventDefault();
    this.dialog.open(AgentsModalComponent, {
      data: {
        agents: this.agentsArray(),
        description: this.description(),
      },
    });
  }
}
