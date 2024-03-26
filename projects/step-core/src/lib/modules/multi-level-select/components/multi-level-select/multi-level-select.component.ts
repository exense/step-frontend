import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { MultiSelectOptionDirective } from '../../directives/multi-select-option.directive';
import { MatOptionSelectionChange } from '@angular/material/core';
import { PlainMultiLevelItem } from '../../types/plain-multi-level-item';
import { MultiLevelItem } from '../../types/multi-level-item';
import { MultiLevelVisualSelectionService } from '../../injectables/multi-level-visual-selection.service';
import { SelectionState } from '../../types/selection-state.enum';

type OnChange<T> = (value: T[]) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-multi-level-select',
  templateUrl: './multi-level-select.component.html',
  styleUrl: './multi-level-select.component.scss',
  imports: [StepBasicsModule, MultiSelectOptionDirective],
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
  implements ControlValueAccessor, MultiLevelVisualSelectionService<T>
{
  private _cd = inject(ChangeDetectorRef);

  private onChange?: OnChange<T>;
  private onTouch?: OnTouch;

  protected isDisabled = false;
  protected selectedItems: T[] = [];

  readonly visualSelectionState = signal<Record<T, SelectionState>>({} as Record<T, SelectionState>);

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
    while (itemsToCheck.length) {
      const { item, level, parent } = itemsToCheck.shift()!;
      const plainItem: PlainMultiLevelItem<T> = { key: item.key, value: item.value, level, parent };
      plainItems.push(plainItem);
      if (item.children?.length) {
        const nextItemsToCheck = item.children.map((item) => ({ item, level: level + 1, parent: plainItem }));
        itemsToCheck.unshift(...nextItemsToCheck);
      }

      itemsAccessCache.set(item.key, item);
    }
    return { plainItems, itemsAccessCache };
  });

  private accessCache = computed(() => this.itemsData().itemsAccessCache);

  protected plainItems = computed(() => this.itemsData().plainItems);

  writeValue(selectedItems: T[]): void {
    this.selectedItems = selectedItems;
    this._cd.markForCheck();
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
    const item = this.accessCache().get(event.source.value);

    const visualSelectionState = this.visualSelectionState();

    if (item?.children?.length) {
      /**
       * Grouped elements are ignored from selection.
       * They are determined by visual-state selection value only
       * Ignore the further code when mat-select, tries to deselect it, because it is the side effect
       * of excluding this element from model
       * **/
      if (!event.source.selected) {
        return;
      }

      const itemsToRemove = [item.key];
      const itemsToAdd: T[] = [];

      if (
        !visualSelectionState[item.key] ||
        visualSelectionState[item.key] === SelectionState.NOT_SELECTED ||
        visualSelectionState[item.key] === SelectionState.CHILD_SELECTED
      ) {
        itemsToAdd.push(...item.children.map((child) => child.key));
      } else {
        const itemsToCheck = [...item.children];
        while (itemsToCheck.length) {
          const item = itemsToCheck.shift()!;
          itemsToRemove.push(item.key);
          if (item.children?.length) {
            itemsToCheck.push(...item.children);
          }
        }
      }

      queueMicrotask(() => {
        const updatedItems = (this.selectedItems ?? []).filter((item) => !itemsToRemove.includes(item));
        updatedItems.push(...itemsToAdd);
        this.selectedItems = updatedItems;
        this.onChange?.(updatedItems);
      });

      return;
    }

    visualSelectionState[item!.key] = event.source.selected ? SelectionState.SELECTED : SelectionState.NOT_SELECTED;

    this.determineParentVisualState(event.source.selected, visualSelectionState, plainItem.parent);

    this.visualSelectionState.set({ ...visualSelectionState });
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

  protected handleBlur(): void {
    this.onTouch?.();
  }

  protected handleSelectedItemsChange(selectedItems: T[]): void {
    const cache = this.accessCache();
    const modelItems = selectedItems.filter((item) => !cache.get(item)?.children?.length);
    this.onChange?.(modelItems);
  }
}
