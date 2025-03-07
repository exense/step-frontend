import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ReportNode } from '../../../../client/step-client-module';

@Component({
  selector: 'step-report-details-error',
  standalone: true,
  imports: [StepBasicsModule],
  templateUrl: './report-details-error.component.html',
  styleUrl: './report-details-error.component.scss',
  host: {
    class: 'data-container error',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailsErrorComponent {
  /** @Input() **/
  readonly node = input<ReportNode | undefined>(undefined);

  protected readonly message = computed(() => this.node()?.error?.msg ?? '');
  protected readonly hasAttachments = computed(() => !!this.node()?.attachments?.length);
}
