import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  TrackByFunction,
  ViewChildren,
} from '@angular/core';
import { AugmentedScreenService } from '../../../../client/augmented/step-augmented-client.module';
import { Input as ColInput } from '../../../../client/generated';
import { map } from 'rxjs';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../../directives/search-col.directive';

@Component({
  selector: 'step-custom-columns',
  templateUrl: './custom-columns.component.html',
  styleUrls: ['./custom-columns.component.scss'],
})
export class CustomColumnsComponent implements OnChanges {
  @Input() screen!: string;
  @Input() excludeFields?: string[];
  @Input() isSearchDisabled?: boolean;

  @Output() columnsReady = new EventEmitter<unknown>();

  columns: ColInput[] = [];

  readonly trackByCol: TrackByFunction<ColInput> = (index, item) => item.id;

  @ViewChildren(MatColumnDef) colDef?: QueryList<MatColumnDef>;
  @ViewChildren(SearchColDirective) searchColDef?: QueryList<SearchColDirective>;

  constructor(private _screenApiService: AugmentedScreenService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const cScreen = changes['screen'];
    const cExcludeFields = changes['excludeFields'];

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
