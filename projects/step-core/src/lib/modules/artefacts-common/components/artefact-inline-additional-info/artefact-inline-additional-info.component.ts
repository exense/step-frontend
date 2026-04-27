import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { InlineArtefactContext } from '../../types/artefact-types';
import { AbstractArtefact } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ATTACHMENTS_EXPORTS } from '../../../attachments';
import { ClampFadeDirective } from '../../../../directives/clamp-fade.directive';

const hasDetail = (details: readonly string[] | undefined, key: string): boolean => !!details?.includes(key);

@Component({
  selector: 'step-artefact-inline-additional-info',
  imports: [StepBasicsModule, ATTACHMENTS_EXPORTS, ClampFadeDirective],
  templateUrl: './artefact-inline-additional-info.component.html',
  styleUrl: './artefact-inline-additional-info.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.hidden]': '!hasData()',
  },
})
export class ArtefactInlineAdditionalInfoComponent {
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

  protected readonly description = computed(() => {
    const ctx = this.context();
    const details = ctx?.details;
    if (!hasDetail(details, 'description')) {
      return undefined;
    }
    return ctx?.aggregatedInfo?.originalArtefact?.description ?? ctx?.reportInfo?.resolvedArtefact?.description;
  });

  protected readonly showAttachmentPreview = computed(() => {
    const ctx = this.context();
    return hasDetail(ctx?.details, 'attachmentPreview');
  });

  protected readonly hasData = computed(() => {
    const hasAttachments = !!this.attachmentMetas().length;
    const error = this.error();
    const description = this.description();
    return hasAttachments || !!error || !!description;
  });
}
