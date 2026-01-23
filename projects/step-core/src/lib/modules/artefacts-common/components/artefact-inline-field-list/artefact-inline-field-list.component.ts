import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { ArtefactInlineItem } from '../../types/artefact-inline-item';
import { ArtefactInlineFieldComponent } from '../artefact-inline-field/artefact-inline-field.component';
import { StepBasicsModule, ElementSizeService, FareShareCalculator } from '../../../basics/step-basics.module';
import { ArtefactInlineItemExplicitWidths } from '../../types/artefact-inline-item-explicit-widths';

const MIN_WIDTH = 100;
const PADDINGS = 6;
const GAP = 6;
const CAP_ICON_SPACE = 20;

@Component({
  selector: 'step-artefact-inline-field-list',
  templateUrl: './artefact-inline-field-list.component.html',
  styleUrl: './artefact-inline-field-list.component.scss',
  imports: [StepBasicsModule, ArtefactInlineFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ArtefactInlineFieldListComponent {
  private _parentContainerSizes = inject(ElementSizeService, { optional: true, skipSelf: true });

  private readonly renderedElements = viewChildren('items', { read: ArtefactInlineFieldComponent });
  private readonly listPrefix = viewChild('listPrefix', { read: ElementRef<HTMLElement> });

  readonly isVertical = input(false);

  readonly items = input([], {
    transform: (value: ArtefactInlineItem[] | undefined) => value ?? [],
  });

  protected readonly displayItems = computed(() => {
    const items = this.items();
    const renderedElements = this.renderedElements() ?? [];
    let availableWidth = this._parentContainerSizes?.width?.();
    const listPrefixWidth = this.listPrefix()?.nativeElement?.offsetWidth ?? 0;
    const isVertical = this.isVertical();
    if (isVertical || !availableWidth || !renderedElements?.length) {
      return items;
    }

    availableWidth = availableWidth - listPrefixWidth - 15;
    const elementsToDisplay = this.determineElementsToDisplay(renderedElements, availableWidth);

    if (elementsToDisplay.length === items.length) {
      const withContainers = renderedElements
        .map((element) => element.getWidths())
        .map((widths) => ({ totalWidth: widths?.total }));

      const totalWidth = FareShareCalculator.calculateWidths(withContainers, GAP, PADDINGS);

      if (totalWidth <= availableWidth) {
        return items;
      }
    }

    if (elementsToDisplay.length < items.length) {
      availableWidth -= CAP_ICON_SPACE;
    }

    return this.determineElementsWithWidths(elementsToDisplay, availableWidth);
  });

  protected readonly showMoreButton = computed(() => {
    const items = this.items();
    const displayItems = this.displayItems();
    return displayItems.length < items.length;
  });

  private determineElementsToDisplay(
    renderedElements: readonly ArtefactInlineFieldComponent[],
    availableWidth: number,
  ): ArtefactInlineFieldComponent[] {
    const result: ArtefactInlineFieldComponent[] = [];

    let totalWidth = 0;
    for (let element of renderedElements) {
      const widths = element.getWidths(MIN_WIDTH);
      if (!widths?.total) {
        continue;
      }

      if (totalWidth !== 0) {
        totalWidth += GAP;
      }
      totalWidth += widths.total + PADDINGS;
      if (totalWidth >= availableWidth) {
        break;
      }
      result.push(element);
    }
    return result;
  }

  private determineElementsWithWidths(
    renderedElementsWithInitialWidths: ArtefactInlineFieldComponent[],
    availableWidth: number,
  ): ArtefactInlineItemExplicitWidths[] {
    const totalCount = renderedElementsWithInitialWidths.reduce((res, item) => res + (item.getCount() ?? 0), 0);
    const fairShareContext = new FareShareCalculator(MIN_WIDTH, GAP, availableWidth, totalCount, PADDINGS);

    let changedItems = this.createItemsWithReallocatedWidths(renderedElementsWithInitialWidths, fairShareContext);
    const isReallocated = fairShareContext.reallocate();
    if (isReallocated) {
      changedItems = this.createItemsWithReallocatedWidths(renderedElementsWithInitialWidths, fairShareContext);
    }

    return changedItems;
  }

  private createItemsWithReallocatedWidths(
    elements: readonly ArtefactInlineFieldComponent[],
    context: FareShareCalculator,
  ): ArtefactInlineItemExplicitWidths[] {
    return elements.map((element) => {
      const item = element.getItem();
      const explicitWidths = element.getWidths();
      context.openContainer();
      explicitWidths.prefix = context.applyFairShare(explicitWidths.prefix);
      explicitWidths.label = context.applyFairShare(explicitWidths.label);
      explicitWidths.value = context.applyFairShare(explicitWidths.value);
      explicitWidths.icon = context.applyFairShare(explicitWidths.icon);
      explicitWidths.suffix = context.applyFairShare(explicitWidths.suffix);
      explicitWidths.total =
        (explicitWidths.prefix ?? 0) +
        (explicitWidths.label ?? 0) +
        (explicitWidths.value ?? 0) +
        (explicitWidths.icon ?? 0) +
        (explicitWidths.suffix ?? 0);

      const result: ArtefactInlineItemExplicitWidths = {
        ...item,
        explicitWidths,
      };
      return result;
    });
  }
}
