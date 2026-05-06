import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { InlineArtefactContext } from '../../types/artefact-types';
import { AbstractArtefact } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ATTACHMENTS_EXPORTS } from '../../../attachments';
import { ClampFadeDirective } from '../../../../directives/clamp-fade.directive';

const hasDetail = (details: readonly string[] | undefined, key: string): boolean => !!details?.includes(key);
type DescriptionMode = 'all' | 'only' | 'exclude';

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
  readonly descriptionMode = input<DescriptionMode>('all');

  protected readonly attachmentMetas = computed(() => {
    if (this.descriptionMode() === 'only') {
      return [];
    }
    const ctx = this.context();
    const reportNode = ctx?.aggregatedInfo?.singleInstanceReportNode ?? ctx?.reportInfo;
    return reportNode?.attachments ?? [];
  });

  protected readonly error = computed(() => {
    if (this.descriptionMode() === 'only') {
      return undefined;
    }
    const ctx = this.context();
    const reportNode = ctx?.aggregatedInfo?.singleInstanceReportNode ?? ctx?.reportInfo;
    return reportNode?.error?.msg;
  });

  protected readonly description = computed(() => {
    if (this.descriptionMode() === 'exclude') {
      return undefined;
    }
    const ctx = this.context();
    const details = ctx?.details;
    if (!hasDetail(details, 'fullDescription') || ctx?.suppressAdditionalInfoDescription) {
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
