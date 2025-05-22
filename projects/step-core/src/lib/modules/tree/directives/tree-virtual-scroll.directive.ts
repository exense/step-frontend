import { computed, Directive, effect, forwardRef, input } from '@angular/core';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { StepAutosizeVirtualScrollStrategy } from '../types/step-autosize-virtual-scroll-strategy';

const DEFAULT_BUFFER_PX_MIN = 100;
const DEFAULT_BUFFER_PX_MAX = 200;

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
  readonly minBufferPxInput = input<number | undefined>(undefined, { alias: 'minBufferPx' });
  readonly maxBufferPxInput = input<number | undefined>(undefined, { alias: 'maxBufferPx' });

  private minBufferPx = computed(() => {
    const minBufferPxInput = this.minBufferPxInput();
    if (minBufferPxInput !== undefined) {
      return minBufferPxInput;
    }
    return DEFAULT_BUFFER_PX_MIN;
  });

  private maxBufferPx = computed(() => {
    const maxBufferPxInput = this.maxBufferPxInput();
    if (maxBufferPxInput !== undefined) {
      return maxBufferPxInput;
    }
    return DEFAULT_BUFFER_PX_MAX;
  });

  readonly strategy = new StepAutosizeVirtualScrollStrategy(DEFAULT_BUFFER_PX_MIN, DEFAULT_BUFFER_PX_MAX);

  private effectUpdateBuffers = effect(() => {
    const minBufferPx = this.minBufferPx();
    const maxBufferPx = this.maxBufferPx();
    this.strategy.updateBufferSize(minBufferPx, maxBufferPx);
  });
}
