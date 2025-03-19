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
import { SelectClearValueDirective, StepBasicsModule } from '../../../basics/step-basics.module';
import { MultiSelectOptionDirective } from '../../directives/multi-select-option.directive';
import { MatOptionSelectionChange } from '@angular/material/core';
import { PlainMultiLevelItem } from '../../types/plain-multi-level-item';
import { MultiLevelVisualSelectionService } from '../../injectables/multi-level-visual-selection.service';
import { SelectionState } from '../../types/selection-state.enum';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MultiLevelArrayItemLabelValueExtractor } from '../../types/multi-level-array-item-label-value-extractor';
import { MultiLevelArrayItemLabelValueDefaultExtractorService } from '../../injectables/multi-level-array-item-label-value-default-extractor.service';

type ModelValue<T> = T | T[] | null | undefined;
type OnChange<T> = (value?: ModelValue<T>) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-multi-level-select',
  templateUrl: './multi-level-select.component.html',
  styleUrl: './multi-level-select.component.scss',
  imports: [StepBasicsModule, MultiSelectOptionDirective, NgxMatSelectSearchModule],
  hostDirectives: [
    {
      directive: SelectClearValueDirective,
      inputs: ['useClear', 'clearValue', 'clearLabel'],
    },
  ],
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
export class MultiLevelSelectComponent<Item = unknown, Value extends string | number | symbol = string>
  implements ControlValueAccessor, MultiLevelVisualSelectionService<Value>, OnInit
{
  private onChange?: OnChange<Value>;
  private onTouch?: OnTouch;
  private readonly _defaultExtractor = inject<MultiLevelArrayItemLabelValueExtractor<Item, Value>>(
    MultiLevelArrayItemLabelValueDefaultExtractorService,
  );

  protected isDisabled = false;
  protected selectedItems?: ModelValue<Value>;
  protected _destroyRef = inject(DestroyRef);
  protected readonly _selectClear = inject(SelectClearValueDirective, { host: true });

  readonly visualSelectionState = signal<Record<Value, SelectionState>>({} as Record<Value, SelectionState>);

  protected readonly filterMultiControl: FormControl<string | null> = new FormControl<string>('');

  readonly items = input<Item[]>([]);
  readonly extractor = input<MultiLevelArrayItemLabelValueExtractor<Item, Value> | undefined>(undefined);
  readonly multiple = input(true);
  readonly tabIndex = input<number | undefined>(undefined);

  private itemsData = computed(() => {
    const extractor = this.extractor() ?? this._defaultExtractor;
    const items = this.items() ?? [];
    const itemsToCheck = items.map((item) => ({
      item,
      level: 0,
      parent: undefined as PlainMultiLevelItem<Value> | undefined,
    }));
    const plainItems: PlainMultiLevelItem<Value>[] = [];

    const itemsAccessCache = new Map<Value, Item>();
    const plainItemsAccessCache = new Map<Value, PlainMultiLevelItem<Value>>();

    while (itemsToCheck.length) {
      const { item, level, parent } = itemsToCheck.shift()!;
      const value = extractor.getValue(item);
      const label = extractor.getLabel(item);
      const plainItem: PlainMultiLevelItem<Value> = { value, label, level, parent };
      plainItems.push(plainItem);

      const children = extractor.getChildren(item);
      if (children?.length) {
        const nextItemsToCheck = children.map((item) => ({ item, level: level + 1, parent: plainItem }));
        itemsToCheck.unshift(...nextItemsToCheck);
      }

      plainItemsAccessCache.set(value, plainItem);
      itemsAccessCache.set(value, item);
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
      if (item.label.toLocaleLowerCase().includes(filterValue) && item.parent) {
        parents.add(item.parent.label.toLowerCase());
      }
    });
    return this.itemsData().plainItems.filter(
      (item) =>
        item.label.toLocaleLowerCase().includes(filterValue) ||
        item.parent?.label.toLocaleLowerCase().includes(filterValue) ||
        parents.has(item.label.toLocaleLowerCase()),
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

  writeValue(selectedItems?: ModelValue<Value>): void {
    if (!this.isModelChanged(selectedItems)) {
      return;
    }
    this.selectedItems = selectedItems;
    this.createVisualStateFromModel();
  }

  registerOnChange(fn: OnChange<Value>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  protected handleSelectionChange(event: MatOptionSelectionChange<Value>, plainItem: PlainMultiLevelItem<Value>): void {
    if (!event.isUserInput) {
      return;
    }

    const extractor = this.extractor() ?? this._defaultExtractor;

    if (!this.multiple()) {
      const visualSelectionState = {} as Record<Value, SelectionState>;
      visualSelectionState[plainItem.value] = SelectionState.SELECTED;
      this.visualSelectionState.set(visualSelectionState);
      this.synchronizeVisualStateWithModel(visualSelectionState);
      return;
    }

    const item = this.accessCache().get(event.source.value);
    const visualSelectionState = this.visualSelectionState();

    // Invert the old selection value (not selected becomes selected)
    const isNewSelected = visualSelectionState[plainItem.value] !== SelectionState.SELECTED;

    const children = extractor.getChildren(item);
    if (children?.length) {
      this.determineChildVisualState(item!, visualSelectionState, isNewSelected);
    }

    visualSelectionState[plainItem.value] = isNewSelected ? SelectionState.SELECTED : SelectionState.NOT_SELECTED;

    this.determineParentVisualState(isNewSelected, visualSelectionState, plainItem.parent);

    this.visualSelectionState.set({ ...visualSelectionState });

    this.synchronizeVisualStateWithModel(visualSelectionState);
  }

  protected clear(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const emptyState = {} as Record<Value, SelectionState>;
    this.visualSelectionState.set(emptyState);
    this.synchronizeVisualStateWithModel(emptyState);
  }

  private determineParentVisualState(
    isChildSelected: boolean,
    visualSelectionState: Record<Value, SelectionState>,
    parent?: PlainMultiLevelItem<Value>,
  ): void {
    if (!parent) {
      return;
    }
    const extractor = this.extractor() ?? this._defaultExtractor;
    const children = extractor.getChildren(this.accessCache().get(parent.value));
    if (!children?.length) {
      return;
    }

    if (isChildSelected) {
      const areAllSelected = children.every((child) => {
        const state = visualSelectionState[extractor.getValue(child)];
        return state === SelectionState.SELECTED || state === SelectionState.CHILD_SELECTED;
      });
      visualSelectionState[parent.value] = areAllSelected ? SelectionState.SELECTED : SelectionState.CHILD_SELECTED;
    } else {
      const areSomeSelected = children!.some((child) => {
        const state = visualSelectionState[extractor.getValue(child)];
        return state === SelectionState.SELECTED || state === SelectionState.CHILD_SELECTED;
      });
      visualSelectionState[parent.value] = areSomeSelected
        ? SelectionState.CHILD_SELECTED
        : SelectionState.NOT_SELECTED;
    }

    this.determineParentVisualState(isChildSelected, visualSelectionState, parent.parent);
  }

  private determineChildVisualState(
    item: Item,
    visualSelectionState: Record<Value, SelectionState>,
    isSelected: boolean,
  ) {
    const extractor = this.extractor() ?? this._defaultExtractor;
    const itemsToProceed = [item];
    while (itemsToProceed.length) {
      const child = itemsToProceed.shift()!;
      const value = extractor.getValue(child);
      visualSelectionState[value] = isSelected ? SelectionState.SELECTED : SelectionState.NOT_SELECTED;
      const children = extractor.getChildren(child);
      if (!!children.length) {
        itemsToProceed.push(...children);
      }
    }
  }

  private synchronizeVisualStateWithModel(visualSelectionState: Record<Value, SelectionState>): void {
    const newModel: Value[] = [];
    const itemsToProceed = [...this.items()];
    const extractor = this.extractor() ?? this._defaultExtractor;
    while (itemsToProceed.length) {
      const item = itemsToProceed.shift()!;
      const value = extractor.getValue(item);
      const children = extractor.getChildren(item);
      if (visualSelectionState[value] === SelectionState.SELECTED) {
        newModel.push(value);
      } else if (children?.length) {
        itemsToProceed.push(...children);
      }
    }

    const model: ModelValue<Value> = this.multiple() ? newModel : newModel[0];
    this.selectedItems = model;
    this.onChange?.(model);
  }

  private createVisualStateFromModel(): void {
    const visualState = {} as Record<Value, SelectionState>;
    const accessCache = this.accessCache();
    const plainItemAccessCache = this.plainItemsAccessCache();
    const extractor = this.extractor() ?? this._defaultExtractor;

    let itemsToProceed: Value[] = [];
    if (this.selectedItems instanceof Array) {
      itemsToProceed = this.selectedItems;
    } else if (!!this.selectedItems) {
      itemsToProceed = [this.selectedItems as Value];
    }

    itemsToProceed.forEach((key) => {
      visualState[key] = SelectionState.SELECTED;

      const item = accessCache.get(key)!;
      const children = extractor.getChildren(item);
      if (!!children?.length) {
        this.determineChildVisualState(item, visualState, true);
      }

      const plainItem = plainItemAccessCache.get(key);
      if (plainItem?.parent) {
        this.determineParentVisualState(true, visualState, plainItem.parent);
      }
    });

    this.visualSelectionState.set(visualState);
  }

  private isModelChanged(newSelectedItems: ModelValue<Value>): boolean {
    if (!(newSelectedItems instanceof Array)) {
      return newSelectedItems !== this.selectedItems;
    }

    const selectedItems = this.selectedItems as Value[];

    if (!selectedItems?.length && !newSelectedItems?.length) {
      return false;
    }

    if (selectedItems?.length !== newSelectedItems.length) {
      return true;
    }

    const newSet = new Set(newSelectedItems);
    const areDifferent = !selectedItems.every((item) => newSet.has(item));
    return areDifferent;
  }

  protected handleBlur(): void {
    this.onTouch?.();
  }
}
