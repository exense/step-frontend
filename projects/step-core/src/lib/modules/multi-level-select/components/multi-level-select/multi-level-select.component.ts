import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  forwardRef,
  inject,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { MultiSelectOptionDirective } from '../../directives/multi-select-option.directive';
import { MatOptionSelectionChange } from '@angular/material/core';
import { PlainMultiLevelItem } from '../../types/plain-multi-level-item';
import { MultiLevelItem } from '../../types/multi-level-item';
import { MultiLevelVisualSelectionService } from '../../injectables/multi-level-visual-selection.service';
import { SelectionState } from '../../types/selection-state.enum';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type OnChange<T> = (value: T[]) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-multi-level-select',
  templateUrl: './multi-level-select.component.html',
  styleUrl: './multi-level-select.component.scss',
  imports: [StepBasicsModule, MultiSelectOptionDirective, NgxMatSelectSearchModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiLevelSelectComponent),
      multi: true,
    },
    {
      provide: MultiLevelVisualSelectionService,
      useExisting: forwardRef(() => MultiLevelSelectComponent),
    },
  ],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiLevelSelectComponent<T extends string | number | symbol>
  implements ControlValueAccessor, MultiLevelVisualSelectionService<T>, OnInit
{
  private onChange?: OnChange<T>;
  private onTouch?: OnTouch;

  protected isDisabled = false;
  protected selectedItems: T[] = [];
  protected _destroyRef = inject(DestroyRef);

  readonly visualSelectionState = signal<Record<T, SelectionState>>({} as Record<T, SelectionState>);

  filterMultiControl: FormControl<string | null> = new FormControl<string>('');

  /** @Input() **/
  items = input<MultiLevelItem<T>[]>([]);

  private itemsData = computed(() => {
    const itemsToCheck = this.items().map((item) => ({
      item,
      level: 0,
      parent: undefined as PlainMultiLevelItem<T> | undefined,
    }));
    const plainItems: PlainMultiLevelItem<T>[] = [];

    const itemsAccessCache = new Map<T, MultiLevelItem<T>>();
    const plainItemsAccessCache = new Map<T, PlainMultiLevelItem<T>>();

    while (itemsToCheck.length) {
      const { item, level, parent } = itemsToCheck.shift()!;
      const plainItem: PlainMultiLevelItem<T> = { key: item.key, value: item.value, level, parent };
      plainItems.push(plainItem);

      if (item.children?.length) {
        const nextItemsToCheck = item.children.map((item) => ({ item, level: level + 1, parent: plainItem }));
        itemsToCheck.unshift(...nextItemsToCheck);
      }

      plainItemsAccessCache.set(item.key, plainItem);
      itemsAccessCache.set(item.key, item);
    }
    return { plainItems, itemsAccessCache, plainItemsAccessCache };
  });

  private accessCache = computed(() => this.itemsData().itemsAccessCache);
  private plainItemsAccessCache = computed(() => this.itemsData().plainItemsAccessCache);
  private filterValue = signal({ value: '' });

  protected plainItems = computed(() => {
    const parents = new Set<string>();
    const filterValue = this.filterValue().value.toLowerCase();
    this.itemsData().plainItems.forEach((item) => {
      if (item.value.toLocaleLowerCase().includes(filterValue) && item.parent) {
        parents.add(item.parent.value.toLowerCase());
      }
    });
    return this.itemsData().plainItems.filter(
      (item) =>
        item.value.toLocaleLowerCase().includes(filterValue) ||
        item.parent?.value.toLocaleLowerCase().includes(filterValue) ||
        parents.has(item.value.toLocaleLowerCase()),
    );
  });

  ngOnInit(): void {
    this.filterMultiControl.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      if (value) {
        this.filterValue.set({ value });
      } else {
        this.filterValue.set({ value: '' });
      }
    });
  }

  writeValue(selectedItems: T[]): void {
    if (!this.isModelChanged(selectedItems)) {
      return;
    }
    this.selectedItems = selectedItems;
    this.createVisualStateFromModel();
  }

  registerOnChange(fn: OnChange<T>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  protected handleSelectionChange(event: MatOptionSelectionChange<T>, plainItem: PlainMultiLevelItem<T>): void {
    if (!event.isUserInput) {
      return;
    }

    const item = this.accessCache().get(event.source.value);

    const visualSelectionState = this.visualSelectionState();

    // Invert the old selection value (not selected becomes selected)
    const isNewSelected = visualSelectionState[item!.key] !== SelectionState.SELECTED;

    if (item?.children?.length) {
      this.determineChildVisualState(item, visualSelectionState, isNewSelected);
    }

    visualSelectionState[item!.key] = isNewSelected ? SelectionState.SELECTED : SelectionState.NOT_SELECTED;

    this.determineParentVisualState(isNewSelected, visualSelectionState, plainItem.parent);

    this.visualSelectionState.set({ ...visualSelectionState });

    this.synchronizeVisualStateWithModel(visualSelectionState);
  }

  private determineParentVisualState(
    isChildSelected: boolean,
    visualSelectionState: Record<T, SelectionState>,
    parent?: PlainMultiLevelItem<T>,
  ): void {
    if (!parent) {
      return;
    }
    const children = this.accessCache().get(parent.key)?.children;
    if (!children) {
      return;
    }

    if (isChildSelected) {
      const areAllSelected = children.every((child) => {
        const state = visualSelectionState[child.key];
        return state === SelectionState.SELECTED || state === SelectionState.CHILD_SELECTED;
      });
      visualSelectionState[parent.key] = areAllSelected ? SelectionState.SELECTED : SelectionState.CHILD_SELECTED;
    } else {
      const areSomeSelected = children!.some((child) => {
        const state = visualSelectionState[child.key];
        return state === SelectionState.SELECTED || state === SelectionState.CHILD_SELECTED;
      });
      visualSelectionState[parent.key] = areSomeSelected ? SelectionState.CHILD_SELECTED : SelectionState.NOT_SELECTED;
    }

    this.determineParentVisualState(isChildSelected, visualSelectionState, parent.parent);
  }

  private determineChildVisualState(
    item: MultiLevelItem<T>,
    visualSelectionState: Record<T, SelectionState>,
    isSelected: boolean,
  ) {
    const itemsToProceed = [item];
    while (itemsToProceed.length) {
      const child = itemsToProceed.shift()!;
      visualSelectionState[child.key] = isSelected ? SelectionState.SELECTED : SelectionState.NOT_SELECTED;
      if (child.children) {
        itemsToProceed.push(...child.children);
      }
    }
  }

  private synchronizeVisualStateWithModel(visualSelectionState: Record<T, SelectionState>): void {
    const newModel: T[] = [];
    const itemsToProceed = [...this.items()];
    while (itemsToProceed.length) {
      const item = itemsToProceed.shift()!;
      if (visualSelectionState[item.key] === SelectionState.SELECTED) {
        newModel.push(item.key);
      } else if (item.children?.length) {
        itemsToProceed.push(...item.children);
      }
    }
    this.selectedItems = newModel;
    this.onChange?.(newModel);
  }

  private createVisualStateFromModel(): void {
    const visualState = {} as Record<T, SelectionState>;
    const accessCache = this.accessCache();
    const plainItemAccessCache = this.plainItemsAccessCache();

    this.selectedItems.forEach((key) => {
      visualState[key] = SelectionState.SELECTED;

      const item = accessCache.get(key)!;
      if (item.children) {
        this.determineChildVisualState(item, visualState, true);
      }

      const plainItem = plainItemAccessCache.get(key)!;
      if (plainItem.parent) {
        this.determineParentVisualState(true, visualState, plainItem.parent);
      }
    });

    this.visualSelectionState.set(visualState);
  }

  private isModelChanged(newSelectedItems: T[]): boolean {
    if (!this.selectedItems?.length && !newSelectedItems?.length) {
      return false;
    }

    if (this.selectedItems.length !== newSelectedItems.length) {
      return true;
    }

    const newSet = new Set(newSelectedItems);
    const areDifferent = !this.selectedItems.every((item) => newSet.has(item));
    return areDifferent;
  }

  protected handleBlur(): void {
    this.onTouch?.();
  }
}
