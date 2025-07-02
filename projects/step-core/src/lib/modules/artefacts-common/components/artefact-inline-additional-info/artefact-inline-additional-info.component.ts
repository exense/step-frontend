import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { InlineArtefactContext } from '../../types/artefact-types';
import { AbstractArtefact, AttachmentMeta } from '../../../../client/step-client-module';
import { PopoverMode, StepBasicsModule } from '../../../basics/step-basics.module';
import { ATTACHMENTS_EXPORTS } from '../../../attachments';
import { AttachmentDialogsService } from '../../../attachments/injectables/attachment-dialogs.service';
import { AttachmentType } from '../../../attachments/types/attachment-type.enum';

@Component({
  selector: 'step-artefact-inline-additional-info',
  imports: [StepBasicsModule, ATTACHMENTS_EXPORTS],
  templateUrl: './artefact-inline-additional-info.component.html',
  styleUrl: './artefact-inline-additional-info.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.hidden]': '!hasData()',
  },
})
export class ArtefactInlineAdditionalInfoComponent {
  private _attachmentDialogs = inject(AttachmentDialogsService);

  readonly context = input<InlineArtefactContext<AbstractArtefact>>();

  protected readonly attachmentMetas = computed(() => {
    const ctx = this.context();
    const reportNode = ctx?.aggregatedInfo?.singleInstanceReportNode ?? ctx?.reportInfo;
    return reportNode?.attachments ?? [];
  });

  protected readonly error = computed(() => {
    const ctx = this.context();
    const reportNode = ctx?.aggregatedInfo?.singleInstanceReportNode ?? ctx?.reportInfo;
    return reportNode?.error?.msg;
  });

  protected readonly hasData = computed(() => {
    const hasAttachments = !!this.attachmentMetas().length;
    const error = this.error();
    return hasAttachments || !!error;
  });

  protected open(attachment: AttachmentMeta, $event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();
    this._attachmentDialogs.showDetails(attachment);
  }

  protected readonly PopoverMode = PopoverMode;
  protected readonly AttachmentType = AttachmentType;
}
