import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RichEditorChangeStatus } from '../../types/rich-editor-change-status.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'step-rich-editor-change-status',
  imports: [CommonModule],
  templateUrl: './rich-editor-change-status.component.html',
  styleUrl: './rich-editor-change-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichEditorChangeStatusComponent {
  /** @Input() **/
  changeStatus = input(RichEditorChangeStatus.NO_CHANGES);

  protected readonly RichEditorChangeStatus = RichEditorChangeStatus;
}
