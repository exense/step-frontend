import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KeyValue } from '@angular/common';
import {
  BulkSelectionType,
  EntitiesSelectionModule,
  RegistrationStrategy,
  selectionCollectionProvider,
  SelectionCollector,
} from '../../../entities-selection/entities-selection.module';
import { StepBasicsModule } from '../../../basics/step-basics.module';
import { TableColumnsConfig, TableModule } from '../../../table/table.module';
import { skip, Subject, takeUntil } from 'rxjs';

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
  standalone: true,
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
    ...selectionCollectionProvider<unknown, KeyValue<unknown, string>>({
      selectionKeyProperty: 'key',
      registrationStrategy: RegistrationStrategy.MANUAL,
    }),
  ],
})
export class ListSelectComponent<T> implements ControlValueAccessor, OnDestroy {
  protected readonly _selectionCollector = inject(SelectionCollector);
  private updateTerminator$?: Subject<void>;

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected bulkSelection = BulkSelectionType.INDIVIDUAL;

  protected isDisabled = signal(false);

  /**
   * @Input()
   * **/
  readonly selectAll = input(SelectAll.NONE);

  /**
   * @Input()
   * **/
  readonly items = input<KeyValue<T, string>[]>([]);

  protected effectRegisterItems = effect(() => {
    const items = this.items();
    this._selectionCollector.registerPossibleSelectionManually(items);
  });

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
      const selection = value ?? [];
      this.bulkSelection = this.determineSelection(selection);
      this._selectionCollector.selectById(...selection);
      this.setupUpdateSubscription();
      return;
    }

    if (!value) {
      const selection = this.items().map((item) => item.key);
      this.bulkSelection = this.determineSelection(selection);
      this._selectionCollector.selectById(...selection);
    } else {
      this.bulkSelection = this.determineSelection(value);
      this._selectionCollector.selectById(...value);
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
    this._selectionCollector.selected$.pipe(skip(1), takeUntil(this.updateTerminator$)).subscribe((value) => {
      this.emitModelChange(value as T[]);
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
