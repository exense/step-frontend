import { computed, Directive, effect, forwardRef, input } from '@angular/core';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { StepVirtualScrollStrategy } from '../types/step-virtual-scroll-strategy';

const MIN_ITEM_SIZE = 47;

@Directive({
  selector: '[stepTreeVirtualScroll]',
  standalone: true,
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (treeVirtualScroll: TreeVirtualScrollDirective) => treeVirtualScroll.strategy,
      deps: [forwardRef(() => TreeVirtualScrollDirective)],
    },
  ],
})
export class TreeVirtualScrollDirective {
  readonly containerHeight = input.required<string>({ alias: 'stepTreeVirtualScroll' });
  readonly minItemSizePxInput = input<number | undefined>(undefined, { alias: 'minItemSizePx' });

  private minItemSizePx = computed(() => {
    const minItemSizePxInput = this.minItemSizePxInput();
    if (minItemSizePxInput !== undefined) {
      return minItemSizePxInput;
    }
    return MIN_ITEM_SIZE;
  });

  protected readonly strategy = new StepVirtualScrollStrategy(MIN_ITEM_SIZE);

  private effectUpdateMinItemSize = effect(() => {
    const minItemSizePx = this.minItemSizePx();
    this.strategy.updateMinItemSize(minItemSizePx);
  });
}
