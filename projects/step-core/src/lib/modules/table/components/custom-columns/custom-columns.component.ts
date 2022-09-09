import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  TrackByFunction,
  ViewChildren,
} from '@angular/core';
import { AugmentedScreenService } from '../../../../client/augmented/step-augmented-client.module';
import { Input as ColInput } from '../../../../client/generated';
import { BehaviorSubject, map } from 'rxjs';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../../directives/search-col.directive';
import { CustomColumnOptions } from '../../services/custom-column-options';

@Component({
  selector: 'step-custom-columns',
  templateUrl: './custom-columns.component.html',
  styleUrls: ['./custom-columns.component.scss'],
  providers: [
    {
      provide: CustomColumnOptions,
      useExisting: forwardRef(() => CustomColumnsComponent),
    },
  ],
})
export class CustomColumnsComponent implements OnChanges, OnDestroy, CustomColumnOptions {
  private readonly sbjOptions$ = new BehaviorSubject<string[]>([]);
  readonly options$ = this.sbjOptions$.asObservable();

  @Input() screen!: string;
  @Input() excludeFields?: string[];
  @Input() isSearchDisabled?: boolean;
  @Input() options?: string | string[];

  @Output() columnsReady = new EventEmitter<unknown>();

  columns: ColInput[] = [];

  readonly trackByCol: TrackByFunction<ColInput> = (index, item) => item.id;

  @ViewChildren(MatColumnDef) colDef?: QueryList<MatColumnDef>;
  @ViewChildren(SearchColDirective) searchColDef?: QueryList<SearchColDirective>;

  constructor(private _screenApiService: AugmentedScreenService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cScreen = changes['screen'];
    const cExcludeFields = changes['excludeFields'];
    const cOptions = changes['options'];

    let screen: string | undefined;
    let excludeFields: string[] | undefined;

    if (cScreen?.previousValue !== cScreen?.currentValue) {
      screen = cScreen?.currentValue;
    }

    if (cExcludeFields?.previousValue !== cExcludeFields?.currentValue) {
      excludeFields = cExcludeFields?.currentValue;
    }

    if (screen || excludeFields) {
      this.loadColumns(screen, excludeFields);
    }

    if (cOptions?.currentValue !== cOptions?.previousValue || cOptions?.firstChange) {
      this.updateOptions(cOptions?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.sbjOptions$.complete();
  }

  private updateOptions(value?: string | string[]): void {
    let result: string[] = [];
    if (value) {
      result = value instanceof Array ? value : [value];
    }
    this.sbjOptions$.next(result);
  }

  private loadColumns(screen?: string, excludeFields?: string[]): void {
    screen = screen || this.screen;
    excludeFields = excludeFields || this.excludeFields;

    if (!screen) {
      this.columns = [];
      return;
    }

    this._screenApiService
      .getInputsForScreenPost(screen)
      .pipe(
        map((inputs) => {
          inputs = inputs.filter(({ id }) => !!id);
          if (!!excludeFields?.length) {
            inputs = inputs.filter(({ id }) => !excludeFields!.includes(id!));
          }
          return inputs;
        })
      )
      .subscribe((inputs) => {
        this.columns = inputs;
        // timeout required to make sure that event is emitted
        // on next cd cycle, so we can be sure then column's rendering completed
        setTimeout(() => {
          this.columnsReady.emit({});
        });
      });
  }
}
