import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ArtefactInlineItem, ItemType } from '@exense/step-core';

@Component({
  selector: 'step-report-details-sections',
  templateUrl: './report-details-sections.component.html',
  styleUrl: './report-details-sections.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportDetailsSectionsComponent {
  readonly items = input<ArtefactInlineItem[] | undefined>(undefined);

  protected readonly configurationItems = computed(() =>
    (this.items() ?? [])
      .filter((item) => item.itemType !== ItemType.result)
      .map(({ itemType, ...item }) => item),
  );

  protected readonly resultItems = computed(() =>
    (this.items() ?? [])
      .filter((item) => item.itemType === ItemType.result)
      .map(({ itemType, ...item }) => item),
  );
}
