import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ReportNode, AttachmentMeta } from '../../../../client/step-client-module';

@Component({
  selector: 'step-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss'],
  standalone: true,
  imports: [StepBasicsModule, AttachmentUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentsComponent {
  private _doc = inject(DOCUMENT);

  /** @Input() **/
  readonly node = input<ReportNode | undefined>(undefined);

  protected readonly attachments = computed(() => this.node()?.attachments ?? []);

  protected readonly singleAttachment = computed(() => {
    const attachments = this.attachments();
    if (attachments.length === 1) {
      return attachments[0];
    }
    return undefined;
  });

  protected readonly hasAttachments = computed(() => this.attachments().length > 0);

  protected openAttachment(attachment: AttachmentMeta): void {
    const url = AttachmentUrlPipe.transform(attachment);
    this._doc!.defaultView!.open(url, '_blank');
  }
}
