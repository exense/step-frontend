import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ArtefactInlineItem } from '../../types/artefact-inline-item';
import { ArtefactInlineFieldComponent } from '../artefact-inline-field/artefact-inline-field.component';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-artefact-inline-field-list',
  templateUrl: './artefact-inline-field-list.component.html',
  styleUrl: './artefact-inline-field-list.component.scss',
  imports: [StepBasicsModule, ArtefactInlineFieldComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtefactInlineFieldListComponent {
  /** @Input() **/
  readonly isVertical = input(false);

  /** @Input() **/
  readonly wrap = input(false);

  /** @Input() **/
  readonly displayLimit = input<number | undefined>(undefined);

  /** @Input() **/
  readonly items = input([], {
    transform: (value: ArtefactInlineItem[] | undefined) => value ?? [],
  });

  /** @Input() **/
  readonly hiddenItemsTooltipSuffix = input('additional item(s)');

  private hiddenItemsCount = computed(() => {
    const items = this.items();
    const limit = this.displayLimit();
    if (limit === undefined) {
      return 0;
    }
    return items.slice(limit).length;
  });

  protected readonly hiddenItemsTooltip = computed(() => {
    const suffix = this.hiddenItemsTooltipSuffix().trim();
    const count = this.hiddenItemsCount();
    if (!count) {
      return '';
    }
    return `${count} ${suffix}`;
  });

  protected readonly displayItems = computed(() => {
    const items = this.items();
    const limit = this.displayLimit();
    if (limit === undefined) {
      return items;
    }
    return items.slice(0, limit);
  });

  protected readonly hasHiddenItems = computed(() => {
    const hiddenItemsCount = this.hiddenItemsCount();
    return hiddenItemsCount > 0;
  });
}
