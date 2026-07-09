import { Component, computed, ElementRef, inject, input, untracked, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { AuthService } from '../../../auth';
import { SkippedAttachmentInfoComponent } from '../skipped-attachment-info/skipped-attachment-info.component';

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
    SkippedAttachmentInfoComponent,
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
  private _auth = inject(AuthService);
  private _attachmentDialogs = inject(AttachmentDialogsService);
  private _attachmentUtils = inject(AttachmentUtilsService);

  protected readonly AttachmentType = AttachmentType;
  protected readonly PopoverMode = PopoverMode;

  readonly attachment = input<AttachmentMetaWithExplicitWidth | undefined>(undefined);
  readonly maxWidth = input<number | undefined>(undefined);
  readonly withPopover = input(true);

  protected readonly hasResourceReadPermission = toSignal(this._auth.hasRight$('resource-read'), {
    initialValue: this._auth.hasRight('resource-read'),
  });

  protected readonly availableWidth = computed<number | undefined>(() => {
    const attachment = this.attachment();
    const maxWidth = this.maxWidth();
    return maxWidth ?? attachment?.explicitWidth;
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
    if (!this.hasResourceReadPermission()) {
      return;
    }
    const attachmentType = this._attachmentUtils.determineAttachmentType(attachment);
    if (attachmentType === AttachmentType.STREAMING_BINARY) {
      const status = (attachment as StreamingAttachmentMeta).status;
      if (status !== 'COMPLETED' && status !== 'FAILED') {
        return;
      }
    }
    this._attachmentDialogs.showDetails(attachment);
  }
}
