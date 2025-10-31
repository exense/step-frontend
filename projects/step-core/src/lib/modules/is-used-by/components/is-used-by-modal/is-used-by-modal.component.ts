import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IsUsedByDialogData, StepBasicsModule } from '../../../basics/step-basics.module';
import { IsUsedByListComponent } from '../is-used-by-list/is-used-by-list.component';
import { AutomationPackagesUsedByResourceListComponent } from '../automation-packages-used-by-resource-list/automation-packages-used-by-resource-list.component';

@Component({
  selector: 'step-is-used-by-modal',
  templateUrl: './is-used-by-modal.component.html',
  imports: [StepBasicsModule, IsUsedByListComponent, AutomationPackagesUsedByResourceListComponent],
  encapsulation: ViewEncapsulation.None,
})
export class IsUsedByModalComponent {
  protected readonly _dialogRef = inject<MatDialogRef<IsUsedByModalComponent>>(MatDialogRef);
  protected readonly _data = inject<IsUsedByDialogData>(MAT_DIALOG_DATA);
  protected readonly isAutomationPackage = this._data.type === 'AUTOMATION_PACKAGE';
}
