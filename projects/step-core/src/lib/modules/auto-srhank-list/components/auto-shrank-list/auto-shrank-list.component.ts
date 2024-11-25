import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { KeyValue } from '@angular/common';
import { ItemWidthRegisterService } from '../../injectables/item-width-register.service';
import { AutoShrankItemDirective } from '../../directives/auto-shrank-item.directive';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { ItemTooltipPipe } from '../../pipes/item-tooltip.pipe';

@Component({
  selector: 'step-auto-shrank-list',
  templateUrl: './auto-shrank-list.component.html',
  styleUrl: './auto-shrank-list.component.scss',
  standalone: true,
  imports: [AutoShrankItemDirective, StepBasicsModule, ItemTooltipPipe],
  providers: [
    {
      provide: ItemWidthRegisterService,
      useExisting: forwardRef(() => AutoShrankListComponent),
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoShrankListComponent implements ItemWidthRegisterService, OnInit, OnDestroy {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private observer?: ResizeObserver;
  private itemWidths = new Map<KeyValue<string, string>, number>();

  /** @Input() **/
  readonly items = input<KeyValue<string, string>[]>([]);

  protected itemsToDisplay = signal<number>(0);

  protected visibleItems = computed(() => {
    const items = this.items();
    const itemsToDisplay = this.itemsToDisplay();
    return items.slice(0, itemsToDisplay);
  });

  protected hiddenItems = computed(() => {
    const items = this.items();
    const itemsToDisplay = this.itemsToDisplay();
    return items.slice(itemsToDisplay);
  });

  protected hasHiddenItems = computed(() => this.hiddenItems().length > 0);

  private effectCleanupWidths = effect(() => {
    const items = new Set(this.items());
    this.itemWidths.forEach((_, key) => {
      if (!items.has(key)) {
        this.itemWidths.delete(key);
      }
    });
  });

  constructor() {
    // recalculate visible items, after rendering and items' change
    afterNextRender(() => this.determineVisibleItems());
  }

  ngOnInit(): void {
    // recalculate visible items, on resize
    this.observer = new ResizeObserver(() => this.determineVisibleItems());
    this.observer.observe(this._elRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.itemWidths.clear();
    this.observer?.disconnect();
  }

  registerWidth(item: KeyValue<string, string>, width: number): void {
    this.itemWidths.set(item, width);
  }

  private determineVisibleItems(): void {
    const possibleWidth = this._elRef.nativeElement.clientWidth - 100;
    let totalWidth = 0;
    const items = this.items();
    let itemsToDisplay = items.length;
    for (let i = 0; i < items.length; i++) {
      const width = this.itemWidths.get(items[i])!;
      totalWidth += width;
      if (totalWidth > possibleWidth) {
        itemsToDisplay = i;
        break;
      }
    }
    this.itemsToDisplay.set(itemsToDisplay);
  }
}
