import { ChangeDetectionStrategy, Component, forwardRef, inject, input, OnDestroy, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KeyValue } from '@angular/common';
import {
  BulkSelectionType,
  EntitiesSelectionModule,
  entitySelectionStateProvider,
  EntitySelectionStateUpdatable,
} from '../../../entities-selection/entities-selection.module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { TableColumnsConfig, TableModule, TablePersistenceConfig } from '../../../table/table.module';
import { skip, Subject, takeUntil } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

type OnChange = <T>(value?: T[]) => void;
type OnTouch = () => void;

export enum SelectAll {
  NONE,
  EMPTY_LIST_WHEN_ALL_SELECTED,
  FILLED_LIST_WHEN_ALL_SELECTED,
}

@Component({
  selector: 'step-list-select',
  templateUrl: './list-select.component.html',
  styleUrl: './list-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepBasicsModule, TableModule, EntitiesSelectionModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListSelectComponent),
      multi: true,
    },
    {
      provide: TableColumnsConfig,
      useValue: null,
    },
    {
      provide: TablePersistenceConfig,
      useValue: null,
    },
    ...entitySelectionStateProvider<unknown, KeyValue<unknown, string>>('key'),
  ],
})
export class ListSelectComponent<T> implements ControlValueAccessor, OnDestroy {
  private _selectionState =
    inject<EntitySelectionStateUpdatable<unknown, KeyValue<unknown, string>>>(EntitySelectionStateUpdatable);
  private updateTerminator$?: Subject<void>;
  private selected$ = toObservable(this._selectionState.selectedKeys);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected isDisabled = signal(false);
  readonly selectAll = input(SelectAll.NONE);
  readonly items = input<KeyValue<T, string>[]>([]);

  writeValue(value?: T[]): void {
    this.assignModel(value);
  }

  registerOnChange(onChange?: OnChange): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouch?: OnTouch): void {
    this.onTouch = onTouch;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  ngOnDestroy(): void {
    this.terminateUpdateSubscription();
  }

  private assignModel(value?: T[]): void {
    this.terminateUpdateSubscription();
    if (this.selectAll() !== SelectAll.EMPTY_LIST_WHEN_ALL_SELECTED) {
      const keys = value ?? [];
      const selectionType = this.determineSelection(keys);
      this._selectionState.updateSelection({ keys, selectionType });
      this.setupUpdateSubscription();
      return;
    }

    if (!value) {
      const keys = this.items().map((item) => item.key);
      const selectionType = this.determineSelection(keys);
      this._selectionState.updateSelection({ keys, selectionType });
    } else {
      const keys = value;
      const selectionType = this.determineSelection(keys);
      this._selectionState.updateSelection({ keys, selectionType });
    }
    this.setupUpdateSubscription();
  }

  private emitModelChange(value?: T[]): void {
    if (this.selectAll() !== SelectAll.EMPTY_LIST_WHEN_ALL_SELECTED) {
      this.onChange?.(value);
      return;
    }

    if (value?.length === this.items().length) {
      this.onChange?.(undefined);
    } else {
      this.onChange?.(value);
    }
  }

  private setupUpdateSubscription(): void {
    this.terminateUpdateSubscription();
    this.updateTerminator$ = new Subject<void>();
    this.selected$.pipe(skip(1), takeUntil(this.updateTerminator$)).subscribe((value) => {
      this.emitModelChange(Array.from(value) as T[]);
      this.onTouch?.();
    });
  }

  private terminateUpdateSubscription(): void {
    this.updateTerminator$?.next();
    this.updateTerminator$?.complete();
    this.updateTerminator$ = undefined;
  }

  private determineSelection(items: T[]): BulkSelectionType {
    if (items.length === 0) {
      return BulkSelectionType.NONE;
    }
    if (items.length === this.items().length) {
      return BulkSelectionType.ALL;
    }
    return BulkSelectionType.INDIVIDUAL;
  }
}
