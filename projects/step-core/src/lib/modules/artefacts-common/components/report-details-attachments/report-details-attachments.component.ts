import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AttachmentMeta } from '../../../../client/step-client-module';
import { ATTACHMENTS_EXPORTS } from '../../../attachments';

@Component({
  selector: 'step-report-details-attachments',
  standalone: true,
  imports: [ATTACHMENTS_EXPORTS],
  templateUrl: './report-details-attachments.component.html',
  styleUrl: './report-details-attachments.component.scss',
  host: {
    class: 'data-container',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailsAttachmentsComponent {
  /** @Input() **/
  readonly attachments = input.required<AttachmentMeta[]>();
}
