import { Component, computed, ElementRef, inject, input, untracked, ViewEncapsulation } from '@angular/core';
import { AttachmentMeta, StreamingAttachmentMeta } from '../../../../client/step-client-module';
import { AttachmentDialogsService } from '../../injectables/attachment-dialogs.service';
import { AttachmentUtilsService } from '../../injectables/attachment-utils.service';
import { AttachmentType } from '../../types/attachment-type.enum';
import { LongInlineTextComponent, PopoverMode, StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentTypeIconPipe } from '../../pipes/attachment-type-icon.pipe';
import { AttachmentPreviewComponent } from '../attachment-preview/attachment-preview.component';
import { AttachmentTypePipe } from '../../pipes/attachment-type.pipe';
import { StepIconsModule } from '../../../step-icons/step-icons.module';
import { StreamingAttachmentIndicatorComponent } from '../streaming-attachment-indicator/streaming-attachment-indicator.component';
import { AttachmentMetaWithExplicitWidth } from '../../types/attachment-meta-with-explicit-width';

@Component({
  selector: 'step-attachment-inline-preview',
  imports: [
    AttachmentPreviewComponent,
    AttachmentTypeIconPipe,
    AttachmentTypePipe,
    LongInlineTextComponent,
    StepBasicsModule,
    StepIconsModule,
    StreamingAttachmentIndicatorComponent,
  ],
  host: {
    '[style.--style__value-max-width.px]': 'availableWidth()',
  },
  templateUrl: './attachment-inline-preview.component.html',
  styleUrl: './attachment-inline-preview.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AttachmentInlinePreviewComponent {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _attachmentDialogs = inject(AttachmentDialogsService);
  private _attachmentUtils = inject(AttachmentUtilsService);

  protected readonly AttachmentType = AttachmentType;
  protected readonly PopoverMode = PopoverMode;

  readonly attachment = input<AttachmentMetaWithExplicitWidth | undefined>(undefined);
  readonly maxWidth = input<number | undefined>(undefined);
  readonly withPopover = input(true);

  readonly availableWidth = computed(() => {
    const attachment = this.attachment();
    const maxWidth = this.maxWidth();
    return maxWidth ?? attachment?.explicitWidth ?? 0;
  });

  getAttachmentData(): AttachmentMetaWithExplicitWidth {
    return untracked(() => this.attachment()!);
  }

  getWidth(maxWidth?: number): number | undefined {
    const width = this._elRef.nativeElement.offsetWidth;
    if (maxWidth && width) {
      return Math.min(maxWidth, width);
    }
    return width;
  }

  protected open(attachment: AttachmentMeta, $event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._attachmentDialogs.showDetails(attachment);
  }

  protected downloadBinaryStream(attachment: StreamingAttachmentMeta, $event: MouseEvent): void {
    if (attachment.status !== 'COMPLETED' && attachment.status !== 'FAILED') {
      return;
    }
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._attachmentUtils.downloadAttachment(attachment);
  }
}
