import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AttachmentMeta, SkippedAttachmentMeta } from '../../../../client/step-client-module';

const NON_STREAMING_ATTACHMENT_QUOTA_URL =
  'https://step.dev/knowledgebase/devdocs/keywordapi/#attachment-quota-per-execution';
const STREAMING_ATTACHMENT_QUOTA_URL =
  'https://step.dev/knowledgebase/userdocs/live-reporting/#streamed-attachment-quota-configuration';

@Component({
  selector: 'step-skipped-attachment-info',
  templateUrl: './skipped-attachment-info.component.html',
  styleUrl: './skipped-attachment-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkippedAttachmentInfoComponent {
  readonly attachment = input.required<AttachmentMeta>();

  protected readonly skippedReason = computed(() => (this.attachment() as SkippedAttachmentMeta).reason ?? '');

  protected readonly documentationUrl = computed(() =>
    this.isStreamingAttachment() ? STREAMING_ATTACHMENT_QUOTA_URL : NON_STREAMING_ATTACHMENT_QUOTA_URL,
  );

  private isStreamingAttachment(): boolean {
    const attachment = this.attachment();
    const searchableText = `${attachment.type ?? ''} ${attachment.name ?? ''} ${this.skippedReason()}`.toLowerCase();
    return searchableText.includes('stream');
  }
}
