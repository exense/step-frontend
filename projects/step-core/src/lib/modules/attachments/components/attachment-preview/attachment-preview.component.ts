import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { AttachmentType } from '../../types/attachment-type.enum';
import { AttachmentUrlPipe } from '../../pipes/attachment-url.pipe';
import { AttachmentMeta } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { NgOptimizedImage } from '@angular/common';
import { AttachmentDialogsService } from '../../injectables/attachment-dialogs.service';
import { AttachmentTypeIconPipe } from '../../pipes/attachment-type-icon.pipe';

@Component({
  selector: 'step-attachment-preview',
  standalone: true,
  imports: [AttachmentUrlPipe, StepBasicsModule, NgOptimizedImage, AttachmentTypeIconPipe],
  templateUrl: './attachment-preview.component.html',
  styleUrl: './attachment-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.with-actions]': 'showDownload() && attachmentType() !== AttachmentType.SKIPPED',
    '[class.with-border]': 'withBorder()',
    '(click)': 'open()',
    '[matTooltip]': 'attachmentType() !== AttachmentType.SKIPPED ? "open attachment" : this.attachment().reason',
  },
})
export class AttachmentPreviewComponent {
  private _attachmentUtils = inject(AttachmentUtilsService);
  private _attachmentDialogs = inject(AttachmentDialogsService);

  readonly attachment = input<AttachmentMeta | undefined>(undefined);
  readonly showDownload = input(true);
  readonly withBorder = input(true);

  protected readonly attachmentType = computed(() => this._attachmentUtils.determineAttachmentType(this.attachment()));
  protected readonly AttachmentType = AttachmentType;

  protected open(): void {
    this._attachmentDialogs.showDetails(this.attachment()!);
  }

  protected download($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._attachmentUtils.downloadAttachment(this.attachment());
  }
}
