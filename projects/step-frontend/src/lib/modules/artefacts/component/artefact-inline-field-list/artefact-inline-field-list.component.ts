import { Component, computed, input } from '@angular/core';
import { ArtefactInlineItem } from '@exense/step-core';

@Component({
  selector: 'step-artefact-inline-field-list',
  templateUrl: './artefact-inline-field-list.component.html',
  styleUrl: './artefact-inline-field-list.component.scss',
})
export class ArtefactInlineFieldListComponent {
  readonly isVertical = input(false);
  readonly wrap = input(false);
  readonly displayLimit = input<number | undefined>(undefined);

  readonly items = input([], {
    transform: (value: ArtefactInlineItem[] | undefined) => value ?? [],
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
    const items = this.items();
    const limit = this.displayLimit();
    if (limit === undefined) {
      return false;
    }
    return limit < items.length;
  });
}
