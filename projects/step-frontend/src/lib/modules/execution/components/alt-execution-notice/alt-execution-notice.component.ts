import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AlertType, ResolvedExecutionNotice } from '@exense/step-core';
import { EXECUTION_NOTICE_ALERT_TYPE, EXECUTION_NOTICE_ICON } from '../../shared/execution-notice-severity';

@Component({
  selector: 'step-alt-execution-notice',
  templateUrl: './alt-execution-notice.component.html',
  styleUrl: './alt-execution-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltExecutionNoticeComponent {
  readonly notice = input.required<ResolvedExecutionNotice>();

  protected readonly alertType = computed(() => EXECUTION_NOTICE_ALERT_TYPE[this.notice().severity] ?? AlertType.INFO);
  protected readonly icon = computed(() => EXECUTION_NOTICE_ICON[this.notice().severity] ?? 'info');
}
