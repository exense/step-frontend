import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { BulkSelectionType } from '../../shared/bulk-selection-type.enum';
import { SelectionCollector } from '../../services/selection-collector/selection-collector';
import { Mutable } from '../../../../shared';
import { filter, Subject, takeUntil } from 'rxjs';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';

type FieldAccessor = Mutable<Pick<BulkSelectionComponent<any, any>, 'isChecked' | 'isIntermediate'>>;

@Component({
  selector: 'step-bulk-selection',
  templateUrl: './bulk-selection.component.html',
  styleUrls: ['./bulk-selection.component.scss'],
  providers: [
    {
      provide: MAT_CHECKBOX_DEFAULT_OPTIONS,
      useValue: {
        clickAction: 'noop',
      } as MatCheckboxDefaultOptions,
    },
  ],
})
export class BulkSelectionComponent<KEY, ENTITY> implements OnChanges, OnDestroy {
  private terminator$?: Subject<void>;

  @Input() selectionCollector?: SelectionCollector<KEY, ENTITY>;
  @Input() showLabel: boolean = true;
  @Input() selectionType: BulkSelectionType = BulkSelectionType.None;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();

  readonly selectionTypes = [
    BulkSelectionType.All,
    BulkSelectionType.Visible,
    BulkSelectionType.Filtered,
    BulkSelectionType.None,
  ];

  readonly isChecked: boolean = false;
  readonly isIntermediate: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cSelectionCollector = changes['selectionCollector'];
    if (cSelectionCollector?.previousValue !== cSelectionCollector?.currentValue || cSelectionCollector?.firstChange) {
      this.setupCollector(cSelectionCollector?.currentValue);
    }
    const cSelectionType = changes['selectionType'];
    if (cSelectionType?.previousValue !== cSelectionCollector?.currentValue) {
      this.changeType(cSelectionType?.currentValue || BulkSelectionType.None);
    }
  }

  ngOnDestroy(): void {
    this.terminate();
  }

  handleCheckboxChange(): void {
    this.changeType(this.selectionType !== BulkSelectionType.None ? BulkSelectionType.None : BulkSelectionType.Visible);
  }

  changeType(selectionType: BulkSelectionType): void {
    const fieldAccessor = this as FieldAccessor;
    this.selectionType = selectionType;
    this.selectionTypeChange.emit(selectionType);

    if (this.selectionCollector) {
      switch (selectionType) {
        case BulkSelectionType.All:
        case BulkSelectionType.Filtered:
        case BulkSelectionType.Visible:
          this.selectionCollector.selectPossibleItems();
          break;
        case BulkSelectionType.None:
          this.selectionCollector.clear();
          break;
        default:
          break;
      }
    }

    switch (selectionType) {
      case BulkSelectionType.All:
        fieldAccessor.isChecked = true;
        fieldAccessor.isIntermediate = false;
        break;
      case BulkSelectionType.None:
        fieldAccessor.isChecked = false;
        fieldAccessor.isIntermediate = false;
        break;
      default:
        fieldAccessor.isChecked = false;
        fieldAccessor.isIntermediate = !!this.selectionCollector?.length;
        break;
    }
  }

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    // required to prevent sort invocation, in case if component is places inside mat-sort-header
    event.stopPropagation();
  }

  private setupCollector(selectionCollector?: SelectionCollector<KEY, ENTITY>): void {
    this.terminate();
    selectionCollector = selectionCollector || this.selectionCollector;
    if (!selectionCollector) {
      return;
    }
    this.terminator$ = new Subject<void>();

    // update individual
    selectionCollector.selected$
      .pipe(
        filter(
          (selected) =>
            (selected.length > 0 && selected.length < selectionCollector!.possibleLength) || selected.length === 1
        ),
        takeUntil(this.terminator$)
      )
      .subscribe(() => {
        if (!selectionCollector?.isSelectingPossible() && this.selectionType !== BulkSelectionType.Individual) {
          this.changeType(BulkSelectionType.Individual);
        }
      });

    // update empty
    selectionCollector.selected$
      .pipe(
        filter((selected) => selected.length === 0),
        takeUntil(this.terminator$)
      )
      .subscribe(() => {
        if (this.selectionType !== BulkSelectionType.None) {
          this.changeType(BulkSelectionType.None);
        }
      });
  }

  private terminate(): void {
    if (!this.terminator$) {
      return;
    }
    this.terminator$.next();
    this.terminator$.complete();
    this.terminator$ = undefined;
  }
}
