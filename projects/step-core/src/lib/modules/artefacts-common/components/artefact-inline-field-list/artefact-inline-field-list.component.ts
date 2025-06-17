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

interface FareShareContext {
  fareShare: number;
  fareShareApplied: number;
}

const MIN_WIDTH = 200;

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

  readonly logOn = computed(() => {
    const items = this.items();
    if (!items.length) {
      return false;
    }
    const firstItem = items[0];
    return firstItem?.label?.value === 'name' && firstItem?.value?.value === 'test';
  });

  protected readonly displayItems = computed(() => {
    const items = this.items();
    const renderedElements = (this.renderedElements() ?? []).map((item) => item);
    const availableWidth = this._parentContainerSizes?.width?.();
    const listPrefixWidth = this.listPrefix()?.nativeElement?.offsetWidth ?? 0;
    const isVertical = this.isVertical();
    const isLog = this.logOn();
    if (isVertical || !availableWidth || !renderedElements?.length) {
      return items;
    }

    const itemsWidth = this.countTotal(renderedElements.map((element) => element.getWidths()));
    if (itemsWidth < availableWidth) {
      return items;
    }

    return this.determineElementsWithWidths(renderedElements, availableWidth - listPrefixWidth - 15);
  });

  protected readonly showMoreButton = computed(() => {
    const items = this.items();
    const displayItems = this.displayItems();
    return displayItems.length < items.length;
  });

  private determineElementsWithWidths(
    renderedElementsWithInitialWidths: ArtefactInlineFieldComponent[],
    availableWidth: number,
    isLog?: boolean,
  ): ArtefactInlineItemExplicitWidths[] {
    let wholeTotal = this.countTotal(renderedElementsWithInitialWidths.map((element) => element.getWidths()));

    let changedItems: ArtefactInlineItemExplicitWidths[] = [];
    let areElementsCountDecreased = false;

    while (wholeTotal > availableWidth && renderedElementsWithInitialWidths.length > 0) {
      const totalCount = renderedElementsWithInitialWidths.reduce((res, item) => res + (item.getCount() ?? 0), 0);
      let fareShare = Math.round(availableWidth / totalCount);
      if (fareShare < MIN_WIDTH) {
        fareShare = MIN_WIDTH;
      }

      if (isLog) {
        console.log('CALCULATIONS');
        console.log('AVAILABLE WIDTH:', availableWidth);
        console.log('ITEMS TOTAL WIDTH:', wholeTotal);
        const widthsString = this.getWidthString(renderedElementsWithInitialWidths.map((el) => el.getWidths()));
        console.log('ELEMENTS: ', widthsString);
        console.log('ELEMENTS COUNT:', totalCount);
        console.log('FARE SHARE:', fareShare, '(availableWidth / totalCount)');
      }

      const fareShareContext: FareShareContext = { fareShare, fareShareApplied: 0 };
      changedItems = this.createItemsWithReallocatedWidths(renderedElementsWithInitialWidths, fareShareContext);
      wholeTotal = this.countTotal(changedItems.map((item) => item.explicitWidths));
      if (isLog) {
        console.log('APPLY FARE SHARE COUNT:', fareShareContext.fareShareApplied);
        const widthsString = this.getWidthString(changedItems.map((item) => item.explicitWidths));
        console.log('ELEMENT RECALCULATED WIDTHS: ', widthsString);
        console.log('RECALCULATED TOTAL WIDTHS:', wholeTotal);
      }

      if (wholeTotal < availableWidth) {
        const unallocated = availableWidth - wholeTotal;
        fareShare = fareShare + Math.round(unallocated / fareShareContext.fareShareApplied);
        if (fareShare < MIN_WIDTH) {
          fareShare = MIN_WIDTH;
        }
        const newFareShareContext: FareShareContext = { fareShare, fareShareApplied: 0 };
        changedItems = this.createItemsWithReallocatedWidths(renderedElementsWithInitialWidths, newFareShareContext);
        wholeTotal = this.countTotal(changedItems.map((item) => item.explicitWidths));

        if (isLog) {
          console.log('UNALLOCATED WIDTH:', unallocated);
          console.log('RECALCULATED FARE SHARE:', fareShare, `(fareShare + unallocated) / applyFareShareCount`);
          const widthsString = this.getWidthString(changedItems.map((item) => item.explicitWidths));
          console.log('RECALCULATED WIDTHS WITH NEW FARE SHARE: ', widthsString);
        }
      }

      if (wholeTotal > availableWidth) {
        renderedElementsWithInitialWidths = renderedElementsWithInitialWidths.slice(0, -1);
        if (!areElementsCountDecreased) {
          areElementsCountDecreased = true;
          // Decrease size of available width, because there will be ... button at the end
          availableWidth -= 20;
        }
      }
    }

    return changedItems;
  }

  private applyFareShare(context: FareShareContext, value?: number): number | undefined {
    if (value !== undefined && value > context.fareShare) {
      context.fareShareApplied++;
      return context.fareShare;
    }
    return value;
  }

  private createItemsWithReallocatedWidths(
    elements: readonly ArtefactInlineFieldComponent[],
    context: FareShareContext,
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

  private countTotal(widths: (WidthContainer | undefined)[]): number {
    return widths
      .filter((widthContainer) => !!widthContainer?.total)
      .map((widthContainer) => widthContainer!.total!)
      .reduce((res, total, index, self) => {
        let value = res + total! + 6;
        if (index < self.length - 1) {
          value += 6;
        }
        return value;
      }, 0);
  }

  private getWidthString(widths: (WidthContainer | undefined)[]): string {
    return widths
      .filter((widthContainer) => !!widthContainer)
      .reduce(
        (res, widthContainer) => [
          ...res,
          `{label: ${widthContainer?.label ?? ''}px, value: ${widthContainer?.value ?? ''}px}`,
        ],
        [] as string[],
      )
      .join('');
  }
}
