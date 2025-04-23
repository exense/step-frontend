import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { AttachmentType } from '../../types/attachment-type.enum';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { AttachmentMeta } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { NgOptimizedImage } from '@angular/common';
import { AttachmentDialogsService } from '../../injectables/attachment-dialogs.service';

@Component({
  selector: 'step-alt-attachment-preview',
  standalone: true,
  imports: [AttachmentUrlPipe, StepBasicsModule, NgOptimizedImage],
  templateUrl: './alt-attachment-preview.component.html',
  styleUrl: './alt-attachment-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.with-actions]': 'showDownload()',
    '(click)': 'open()',
  },
})
export class AltAttachmentPreviewComponent {
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _attachmentDialogs = inject(AttachmentDialogsService);

  readonly attachment = input<AttachmentMeta | undefined>(undefined);
  readonly showDownload = input(true);

  protected readonly attachmentType = computed(() => this._attachmentUtils.determineAttachmentType(this.attachment()));
  protected readonly AttachmentType = AttachmentType;

  protected open(): void {
    this._attachmentDialogs.showDetails(this.attachment()!);
  }

  protected download(): void {
    this._attachmentUtils.downloadAttachment(this.attachment());
  }
}
