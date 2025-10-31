import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AlertType, StepCoreModule } from '@exense/step-core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'step-automation-package-warnings-dialog',
  imports: [StepCoreModule],
  templateUrl: './automation-package-warnings-dialog.component.html',
  styleUrl: './automation-package-warnings-dialog.component.scss',
  host: {
    class: 'messages-view-dialog',
  },
  encapsulation: ViewEncapsulation.None,
})
export class AutomationPackageWarningsDialogComponent {
  protected readonly _warnings = inject<string[]>(MAT_DIALOG_DATA);
  protected readonly AlertType = AlertType;
}
