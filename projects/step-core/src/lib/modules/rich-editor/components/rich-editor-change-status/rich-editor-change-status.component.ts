import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RichEditorChangeStatus } from '../../types/rich-editor-change-status.enum';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-rich-editor-change-status',
  imports: [StepBasicsModule],
  templateUrl: './rich-editor-change-status.component.html',
  styleUrl: './rich-editor-change-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichEditorChangeStatusComponent {
  readonly changeStatus = input(RichEditorChangeStatus.NO_CHANGES);
  readonly showSaveBtn = input(false);
  readonly saveBtnTooltip = input('Save');
  readonly save = output();

  protected readonly RichEditorChangeStatus = RichEditorChangeStatus;

  protected readonly statusText = computed(() => {
    const status = this.changeStatus();
    switch (status) {
      case RichEditorChangeStatus.NO_CHANGES:
        return 'No changes';
      case RichEditorChangeStatus.PENDING_CHANGES:
        return 'Pending changes';
      case RichEditorChangeStatus.SAVED:
        return 'Saved';
    }
  });
}
