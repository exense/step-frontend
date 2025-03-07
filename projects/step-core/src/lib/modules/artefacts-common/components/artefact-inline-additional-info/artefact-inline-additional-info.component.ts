import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { InlineArtefactContext } from '../../types/artefact-types';
import { AbstractArtefact } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-artefact-inline-additional-info',
  standalone: true,
  imports: [StepBasicsModule],
  templateUrl: './artefact-inline-additional-info.component.html',
  styleUrl: './artefact-inline-additional-info.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.hidden]': '!hasData()',
  },
})
export class ArtefactInlineAdditionalInfoComponent {
  /** @Input()  **/
  readonly context = input<InlineArtefactContext<AbstractArtefact>>();

  protected readonly attachmentsCountTooltip = computed(() => {
    const ctx = this.context();
    const reportNode = ctx?.aggregatedInfo?.singleInstanceReportNode ?? ctx?.reportInfo;
    const count = reportNode?.attachments?.length;
    return !count ? undefined : `${count} attachment(s)`;
  });

  protected readonly error = computed(() => {
    const ctx = this.context();
    const reportNode = ctx?.aggregatedInfo?.singleInstanceReportNode ?? ctx?.reportInfo;
    return reportNode?.error?.msg;
  });

  protected readonly hasData = computed(() => {
    const attachmentsCountTooltip = this.attachmentsCountTooltip();
    const error = this.error();
    return !!attachmentsCountTooltip || !!error;
  });
}
