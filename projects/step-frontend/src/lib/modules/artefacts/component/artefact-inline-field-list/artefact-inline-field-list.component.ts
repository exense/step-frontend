import { Component, computed, input, signal } from '@angular/core';
import { ArtefactInlineItem, PopoverMode } from '@exense/step-core';

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

  protected isHiddenVisible = signal(false);

  protected readonly displayItems = computed(() => {
    const items = this.items();
    const limit = this.displayLimit();
    if (limit === undefined) {
      return items;
    }
    return items.slice(0, limit);
  });

  protected readonly hiddenItems = computed(() => {
    const items = this.items();
    const limit = this.displayLimit();
    if (limit === undefined) {
      return [];
    }
    return items.slice(limit);
  });

  protected readonly hasHiddenItems = computed(() => this.hiddenItems().length > 0);
  protected readonly PopoverMode = PopoverMode;
}
