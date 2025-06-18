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
import { StepBasicsModule, ElementSizeService } from '../../../basics/step-basics.module';
import { ArtefactInlineItemExplicitWidths } from '../../types/artefact-inline-item-explicit-widths';
import { WidthContainer } from '../../types/width-container';

interface FairShareContext {
  fairShare: number;
  fairShareApplied: number;
}

const MIN_WIDTH = 200;
const PADDINGS = 6;
const GAP = 6;
const CAP_ICON_SPACE = 20;

@Component({
  selector: 'step-artefact-inline-field-list',
  templateUrl: './artefact-inline-field-list.component.html',
  styleUrl: './artefact-inline-field-list.component.scss',
  imports: [StepBasicsModule, ArtefactInlineFieldComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ArtefactInlineFieldListComponent {
  private _parentContainerSizes = inject(ElementSizeService, { optional: true, skipSelf: true });

  private renderedElements = viewChildren('items', { read: ArtefactInlineFieldComponent });
  private listPrefix = viewChild('listPrefix', { read: ElementRef<HTMLElement> });

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
      const totalWidth = this.countTotalWidth(renderedElements.map((element) => element.getWidths()));
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
    let changedItems: ArtefactInlineItemExplicitWidths[] = [];

    const totalCount = renderedElementsWithInitialWidths.reduce((res, item) => res + (item.getCount() ?? 0), 0);
    let fairShare = Math.round(availableWidth / totalCount);
    if (fairShare < MIN_WIDTH) {
      fairShare = MIN_WIDTH;
    }

    const fairShareContext: FairShareContext = { fairShare, fairShareApplied: 0 };
    changedItems = this.createItemsWithReallocatedWidths(renderedElementsWithInitialWidths, fairShareContext);
    const totalWidth = this.countTotalWidth(changedItems.map((item) => item.explicitWidths));

    if (totalWidth < availableWidth) {
      const unallocated = availableWidth - totalWidth;
      fairShare = fairShare + Math.round(unallocated / fairShareContext.fairShareApplied);
      if (fairShare < MIN_WIDTH) {
        fairShare = MIN_WIDTH;
      }
      changedItems = this.createItemsWithReallocatedWidths(renderedElementsWithInitialWidths, {
        fairShare,
        fairShareApplied: 0,
      });
    }

    return changedItems;
  }

  private applyFareShare(context: FairShareContext, value?: number): number | undefined {
    if (value !== undefined && value > context.fairShare) {
      context.fairShareApplied++;
      return context.fairShare;
    }
    return value;
  }

  private createItemsWithReallocatedWidths(
    elements: readonly ArtefactInlineFieldComponent[],
    context: FairShareContext,
  ): ArtefactInlineItemExplicitWidths[] {
    return elements.map((element) => {
      const item = element.getItem();
      const explicitWidths = element.getWidths();
      explicitWidths.prefix = this.applyFareShare(context, explicitWidths.prefix);
      explicitWidths.label = this.applyFareShare(context, explicitWidths.label);
      explicitWidths.value = this.applyFareShare(context, explicitWidths.value);
      explicitWidths.icon = this.applyFareShare(context, explicitWidths.icon);
      explicitWidths.suffix = this.applyFareShare(context, explicitWidths.suffix);
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

  private countTotalWidth(widths: (WidthContainer | undefined)[]): number {
    return widths
      .filter((widthContainer) => !!widthContainer?.total)
      .map((widthContainer) => widthContainer!.total!)
      .reduce((res, total, index, self) => {
        let value = res + total! + PADDINGS;
        if (index < self.length - 1) {
          value += GAP;
        }
        return value;
      }, 0);
  }
}
