import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'step-agents-modal',
  templateUrl: './execution-agent-modal.component.html',
})
export class AgentsModalComponent {
  constructor(
    public dialogRef: MatDialogRef<AgentsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { agents: string[]; description: string },
  ) {}

  close() {
    this.dialogRef.close();
  }
}
