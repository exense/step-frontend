import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ArtefactInlineItem } from '@exense/step-core';

@Component({
  selector: 'step-report-details-fields',
  templateUrl: './report-details-fields.component.html',
  styleUrl: './report-details-fields.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportDetailsFieldsComponent {
  readonly items = input<ArtefactInlineItem[] | undefined>(undefined);

  protected readonly configurationItems = computed(() => {
    return this.withoutIcons((this.items() ?? []).filter((item) => item.icon === 'log-in'));
  });

  protected readonly resultItems = computed(() => {
    return this.withoutIcons((this.items() ?? []).filter((item) => item.icon === 'log-out'));
  });

  private withoutIcons(items: ArtefactInlineItem[]): ArtefactInlineItem[] {
    return items.map((item) => ({ ...item, icon: undefined, iconTooltip: undefined }));
  }
}
