import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ReportNode, AttachmentMeta } from '../../../../client/step-client-module';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';

@Component({
  selector: 'step-legacy-attachments',
  templateUrl: './legacy-attachments.component.html',
  styleUrls: ['./legacy-attachments.component.scss'],
  imports: [StepBasicsModule, AttachmentUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegacyAttachmentsComponent {
  private _doc = inject(DOCUMENT);
  private _attachmentUtils = inject(AttachmentUtilsService);

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
    const url = this._attachmentUtils.getDownloadAttachmentUrl(attachment!);
    this._doc!.defaultView!.open(url, '_blank');
  }
}
