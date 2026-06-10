import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  input,
  OnDestroy,
  signal,
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
const OFFSET = 15;
const MAX_MEASURABLE_ITEMS = 20;
const INITIAL_VERTICAL_RENDERED_ITEMS = 20;
const MIN_VERTICAL_RENDER_CHUNK = 20;
const MAX_VERTICAL_RENDER_CHUNK = 160;

@Component({
  selector: 'step-artefact-inline-field-list',
  templateUrl: './artefact-inline-field-list.component.html',
  styleUrl: './artefact-inline-field-list.component.scss',
  imports: [StepBasicsModule, ArtefactInlineFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ArtefactInlineFieldListComponent implements OnDestroy {
  private _parentContainerSizes = inject(ElementSizeService, { optional: true, skipSelf: true });

  private readonly renderedElements = viewChildren('items', { read: ArtefactInlineFieldComponent });
  private readonly listPrefix = viewChild('listPrefix', { read: ElementRef<HTMLElement> });
  private readonly verticalRenderState = signal<{ target: number; limit: number } | undefined>(undefined);
  private verticalRenderFrame?: number;
  private verticalRenderChunkSize = MIN_VERTICAL_RENDER_CHUNK;

  readonly isVertical = input(false);
  readonly hideIcons = input(false);
  readonly columnCount = input(1);

  readonly items = input([], {
    transform: (value: ArtefactInlineItem[] | undefined) => value ?? [],
  });

  protected readonly measurableItems = computed(() => this.items().slice(0, MAX_MEASURABLE_ITEMS));

  protected readonly displayItems = computed(() => {
    const items = this.items();
    const renderedElements = this.renderedElements() ?? [];
    let availableWidth = this._parentContainerSizes?.width?.();
    const listPrefixWidth = this.listPrefix()?.nativeElement?.offsetWidth ?? 0;
    const isVertical = this.isVertical();
    if (isVertical || !availableWidth || !renderedElements?.length) {
      return items;
    }

    availableWidth = availableWidth - listPrefixWidth - OFFSET;
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

  protected readonly renderedDisplayItems = computed(() => {
    const displayItems = this.displayItems();
    const verticalRenderTarget = this.verticalRenderTarget();
    if (verticalRenderTarget === undefined) {
      return displayItems;
    }
    const verticalRenderState = this.verticalRenderState();
    const limit = verticalRenderState?.target === verticalRenderTarget ? verticalRenderState.limit : undefined;
    return displayItems.slice(0, limit ?? INITIAL_VERTICAL_RENDERED_ITEMS);
  });

  private readonly verticalRenderTarget = computed(() => {
    const displayItemsLength = this.displayItems().length;
    const isVertical = this.isVertical();
    return isVertical && displayItemsLength > INITIAL_VERTICAL_RENDERED_ITEMS ? displayItemsLength : undefined;
  });

  private readonly progressiveVerticalRenderEffect = effect(() => {
    const verticalRenderTarget = this.verticalRenderTarget();

    this.cancelProgressiveVerticalRender();
    this.verticalRenderChunkSize = MIN_VERTICAL_RENDER_CHUNK;

    if (verticalRenderTarget === undefined) {
      return;
    }

    this.scheduleProgressiveVerticalRender(verticalRenderTarget);
  });

  ngOnDestroy(): void {
    this.cancelProgressiveVerticalRender();
  }

  private scheduleProgressiveVerticalRender(totalItems: number): void {
    this.verticalRenderFrame = requestAnimationFrame(() => {
      const currentState = this.verticalRenderState();
      const currentLimit = currentState?.target === totalItems ? currentState.limit : INITIAL_VERTICAL_RENDERED_ITEMS;
      if (currentLimit >= totalItems) {
        return;
      }

      const nextLimit = Math.min(totalItems, currentLimit + this.verticalRenderChunkSize);
      this.verticalRenderState.set({ target: totalItems, limit: nextLimit });
      this.verticalRenderChunkSize = Math.min(this.verticalRenderChunkSize * 2, MAX_VERTICAL_RENDER_CHUNK);
      this.scheduleProgressiveVerticalRender(totalItems);
    });
  }

  private cancelProgressiveVerticalRender(): void {
    if (this.verticalRenderFrame === undefined) {
      return;
    }
    cancelAnimationFrame(this.verticalRenderFrame);
    this.verticalRenderFrame = undefined;
  }

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
