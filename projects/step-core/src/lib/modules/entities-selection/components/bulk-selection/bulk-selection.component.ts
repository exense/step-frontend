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
import { filter, Subject, takeUntil } from 'rxjs';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { RegistrationStrategy } from '../../shared/registration.strategy';

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
  standalone: false,
})
export class BulkSelectionComponent<KEY, ENTITY> implements OnChanges, OnDestroy {
  private terminator$?: Subject<void>;

  @Input() selectionCollector?: SelectionCollector<KEY, ENTITY>;
  @Input() showLabel: boolean = true;
  @Input() selectionType: BulkSelectionType = BulkSelectionType.NONE;
  @Input() isDisabled: boolean = false;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();

  protected isChecked: boolean = false;
  protected isIntermediate: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cSelectionCollector = changes['selectionCollector'];
    if (cSelectionCollector?.previousValue !== cSelectionCollector?.currentValue || cSelectionCollector?.firstChange) {
      this.setupCollector(cSelectionCollector?.currentValue);
    }
    const cSelectionType = changes['selectionType'];
    if (cSelectionType?.previousValue !== cSelectionCollector?.currentValue) {
      this.changeType(cSelectionType?.currentValue || BulkSelectionType.NONE);
    }
  }

  ngOnDestroy(): void {
    this.terminate();
  }

  handleCheckboxChange(): void {
    this.changeType(this.selectionType !== BulkSelectionType.NONE ? BulkSelectionType.NONE : BulkSelectionType.VISIBLE);
  }

  changeType(selectionType: BulkSelectionType): void {
    this.selectionType = selectionType;

    if (this.selectionCollector) {
      switch (selectionType) {
        case BulkSelectionType.ALL:
        case BulkSelectionType.FILTERED:
        case BulkSelectionType.VISIBLE:
          this.selectionCollector.selectPossibleItems();
          if (this.selectionCollector.registrationStrategy === RegistrationStrategy.MANUAL) {
            // In case of manual registration, it's assumed that registered possible items, are the whole list
            selectionType = BulkSelectionType.ALL;
          }
          break;
        case BulkSelectionType.NONE:
          this.selectionCollector.clear();
          break;
        default:
          break;
      }
    }

    this.selectionType = selectionType;
    this.selectionTypeChange.emit(selectionType);

    switch (selectionType) {
      case BulkSelectionType.ALL:
        this.isChecked = true;
        this.isIntermediate = false;
        break;
      case BulkSelectionType.NONE:
        this.isChecked = false;
        this.isIntermediate = false;
        break;
      default:
        this.isChecked = false;
        this.isIntermediate = !!this.selectionCollector?.length;
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
            (selected.length > 0 && selected.length < selectionCollector!.possibleLength) || selected.length === 1,
        ),
        takeUntil(this.terminator$),
      )
      .subscribe(() => {
        if (!selectionCollector?.isSelectingPossible() && this.selectionType !== BulkSelectionType.INDIVIDUAL) {
          this.changeType(BulkSelectionType.INDIVIDUAL);
        }
      });

    // update empty
    selectionCollector.selected$
      .pipe(
        filter((selected) => selected.length === 0),
        takeUntil(this.terminator$),
      )
      .subscribe(() => {
        if (this.selectionType !== BulkSelectionType.NONE) {
          this.changeType(BulkSelectionType.NONE);
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
