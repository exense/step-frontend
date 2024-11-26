import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { PopoverMode, StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-auto-shrank-list',
  templateUrl: './auto-shrank-list.component.html',
  styleUrl: './auto-shrank-list.component.scss',
  standalone: true,
  imports: [AutoShrankItemDirective, StepBasicsModule],
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
  private itemWidths = new Map<string, number>();

  /** @Input() **/
  readonly items = input<KeyValue<string, string>[]>([]);

  private itemWidthKeys = computed(() => this.items().map((item) => this.widthKey(item)));

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
  protected isHiddenVisible = signal(false);

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
    this.itemWidths.set(this.widthKey(item), width);
  }

  private determineVisibleItems(): void {
    const possibleWidth = this._elRef.nativeElement.clientWidth - 100;
    let totalWidth = 0;
    const widthKeys = this.itemWidthKeys();
    let itemsToDisplay = widthKeys.length;
    for (let [i, widthKey] of widthKeys.entries()) {
      const width = this.itemWidths.get(widthKey) ?? 0;
      totalWidth += width;
      if (totalWidth > possibleWidth) {
        itemsToDisplay = i;
        break;
      }
    }
    this.itemsToDisplay.set(itemsToDisplay);
  }

  private widthKey(item: KeyValue<string, string>): string {
    return `${item.key}_${item.value}`;
  }

  protected readonly PopoverMode = PopoverMode;
}
