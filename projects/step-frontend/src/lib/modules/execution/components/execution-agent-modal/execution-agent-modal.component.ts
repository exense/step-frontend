import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-agents-modal',
  templateUrl: './execution-agent-modal.component.html',
})
export class AgentsModalComponent {
  protected _data = inject<{ agents: string[]; description: string }>(MAT_DIALOG_DATA);
}
