import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { AttachmentMeta } from '../../../../client/step-client-module';
import { ElementSizeService, FareShareCalculator, StepBasicsModule } from '../../../basics/step-basics.module';
import { AttachmentInlinePreviewComponent } from '../attachment-inline-preview/attachment-inline-preview.component';
import { AttachmentMetaWithExplicitWidth } from '../../types/attachment-meta-with-explicit-width';

const GAP = 5;
const MIN_WIDTH = 150;
const PADDINGS = 6;
const CAP_ICON_SPACE = 20;

@Component({
  selector: 'step-attachment-inline-preview-list',
  imports: [StepBasicsModule, AttachmentInlinePreviewComponent],
  templateUrl: './attachment-inline-preview-list.component.html',
  styleUrl: './attachment-inline-preview-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AttachmentInlinePreviewListComponent implements AfterViewInit {
  private _parentContainerSizes = inject(ElementSizeService, { optional: true, skipSelf: true });

  private readonly renderedElements = viewChildren('items', { read: AttachmentInlinePreviewComponent });
  private readonly listPrefix = viewChild('listPrefix', { read: ElementRef<HTMLElement> });

  readonly attachmentMetas = input([], {
    transform: (value?: AttachmentMeta[]): AttachmentMetaWithExplicitWidth[] | undefined => {
      if (!value?.length) {
        return undefined;
      }
      return value.map((item) => ({ ...item, explicitWidth: MIN_WIDTH }));
    },
  });

  protected readonly attachments = linkedSignal(() => this.attachmentMetas());

  protected readonly displayItems = computed(() => {
    const items = this.attachments() ?? [];
    const renderedElements = this.renderedElements() ?? [];
    let availableWidth = this._parentContainerSizes?.width?.();
    const listPrefixWidth = this.listPrefix()?.nativeElement?.offsetWidth ?? 0;

    if (!availableWidth || !renderedElements?.length) {
      return items;
    }

    availableWidth = availableWidth - listPrefixWidth - 15;
    const elementsToDisplay = this.determineElementsToDisplay(renderedElements, availableWidth);

    if (elementsToDisplay.length === items.length) {
      const withContainers = renderedElements
        .map((element) => element.getWidth())
        .map((totalWidth) => ({ totalWidth }));

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
    const items = this.attachmentMetas() ?? [];
    const displayItems = this.displayItems();
    return displayItems.length < items.length;
  });

  ngAfterViewInit(): void {
    // force attachments to redraw, after initial rendering has been done
    // and item's sizes were determined
    this.attachments.update((items) => (!items ? items : [...items]));
  }

  private determineElementsToDisplay(
    renderedElements: readonly AttachmentInlinePreviewComponent[],
    availableWidth: number,
  ): AttachmentInlinePreviewComponent[] {
    const result: AttachmentInlinePreviewComponent[] = [];

    let totalWidth = 0;
    for (let element of renderedElements) {
      let width = element.getWidth(MIN_WIDTH);
      if (!width) {
        continue;
      }

      if (totalWidth !== 0) {
        totalWidth += GAP + PADDINGS;
      }
      totalWidth += width;
      if (totalWidth >= availableWidth) {
        break;
      }
      result.push(element);
    }

    return result;
  }

  private determineElementsWithWidths(
    renderedElementsWithInitialWidths: AttachmentInlinePreviewComponent[],
    availableWidth: number,
  ): AttachmentMetaWithExplicitWidth[] {
    const totalCount = renderedElementsWithInitialWidths.length;

    const fairShareContext = new FareShareCalculator(MIN_WIDTH, GAP, availableWidth, totalCount, PADDINGS);

    let changedItems = this.createItemsWithReallocatedWidths(renderedElementsWithInitialWidths, fairShareContext);
    const isReallocated = fairShareContext.reallocate();
    if (isReallocated) {
      changedItems = this.createItemsWithReallocatedWidths(renderedElementsWithInitialWidths, fairShareContext);
    }
    return changedItems;
  }

  private createItemsWithReallocatedWidths(
    elements: readonly AttachmentInlinePreviewComponent[],
    context: FareShareCalculator,
  ): AttachmentMetaWithExplicitWidth[] {
    return elements.map((element) => {
      const item = element.getAttachmentData();
      let explicitWidth = element.getWidth(MIN_WIDTH);
      context.openContainer();
      explicitWidth = context.applyFairShare(explicitWidth);
      return {
        ...item,
        explicitWidth,
      };
    });
  }
}
