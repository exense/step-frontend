import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AceMode, RICH_EDITOR_EXPORTS } from '../../../rich-editor';

@Component({
  selector: 'step-detailed-value-dialog',
  standalone: true,
  imports: [StepBasicsModule, RICH_EDITOR_EXPORTS],
  templateUrl: './detailed-value-dialog.component.html',
  styleUrl: './detailed-value-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedValueDialogComponent {
  protected _data = inject<string>(MAT_DIALOG_DATA);
  protected readonly AceMode = AceMode;
}
