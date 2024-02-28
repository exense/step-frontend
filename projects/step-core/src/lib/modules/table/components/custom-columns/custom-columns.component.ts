import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  Signal,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { AugmentedScreenService, ScreenInput } from '../../../../client/step-client-module';
import { BehaviorSubject, filter, Subject, switchMap } from 'rxjs';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../../directives/search-col.directive';
import { CustomColumnOptions } from '../../services/custom-column-options';
import { CustomColumnsBaseComponent } from './custom-columns-base.component';
import { MatDialog } from '@angular/material/dialog';
import {
  CustomColumnEditorDialogComponent,
  CustomColumnEditorDialogOperation,
  CustomColumnEditorDialogResult,
} from '../custom-column-editor-dialog/custom-column-editor-dialog.component';
import { ColumnEditorDialogData } from '../../types/column-editor-dialog-data';
import { TableColumnsReconfigure } from '../../services/table-columns-reconfigure';
import { TableCustomColumnsService } from '../../services/table-custom-columns.service';

@Component({
  selector: 'step-custom-columns',
  templateUrl: './custom-columns.component.html',
  styleUrls: ['./custom-columns.component.scss'],
  providers: [
    {
      provide: CustomColumnOptions,
      useExisting: forwardRef(() => CustomColumnsComponent),
    },
    {
      provide: CustomColumnsBaseComponent,
      useExisting: forwardRef(() => CustomColumnsComponent),
    },
  ],
})
export class CustomColumnsComponent
  implements OnInit, OnChanges, OnDestroy, CustomColumnOptions, CustomColumnsBaseComponent
{
  private _customColumns = inject(TableCustomColumnsService);
  private _columnsReconfigure = inject(TableColumnsReconfigure);
  private _screenApiService = inject(AugmentedScreenService);
  private _matDialog = inject(MatDialog);

  private readonly optionsInternal$ = new BehaviorSubject<string[]>([]);
  private columnsReadyInternal$ = new Subject<boolean>();

  readonly options$ = this.optionsInternal$.asObservable();
  readonly columnsReady$ = this.columnsReadyInternal$.asObservable();

  @Input({ required: true }) screen!: string;
  private columns?: Signal<ScreenInput[]>;

  /* @Input() */
  excludeFields = input<string[] | undefined>();

  readonly displayColumns = computed(() => {
    const columns = this.columns?.() ?? [];
    const excludeFields = new Set(this.excludeFields() ?? []);
    if (!excludeFields.size) {
      return columns;
    }
    return columns.filter((col) => !excludeFields.has(col.input!.id!));
  });

  @Input() isSearchDisabled?: boolean;
  @Input() options?: string | string[];
  @Input() configurable?: boolean;

  @ViewChildren(MatColumnDef) colDef?: QueryList<MatColumnDef>;
  @ViewChildren(SearchColDirective) searchColDef?: QueryList<SearchColDirective>;

  ngOnInit(): void {
    this.columns = this._customColumns.getScreenColumnsSignal(this.screen);
    this._customColumns
      .updateColumnsForScreen(this.screen)
      .pipe(filter((isSuccess) => !!isSuccess))
      .subscribe((isSuccess) => {
        setTimeout(() => {
          this.columnsReadyInternal$.next(true);
        });
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cOptions = changes['options'];
    if (cOptions?.currentValue !== cOptions?.previousValue || cOptions?.firstChange) {
      this.updateOptions(cOptions?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.optionsInternal$.complete();
    this.columnsReadyInternal$.complete();
  }

  configureColumn(col: ScreenInput, $event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();

    this._matDialog
      .open<CustomColumnEditorDialogComponent, ColumnEditorDialogData, CustomColumnEditorDialogResult>(
        CustomColumnEditorDialogComponent,
        { data: { screenInput: col } },
      )
      .afterClosed()
      .pipe(
        filter((result) => !!result),
        switchMap((result) => {
          switch (result!.operation) {
            case CustomColumnEditorDialogOperation.SAVE:
              return this._screenApiService.saveInput(result!.screenInput);
            case CustomColumnEditorDialogOperation.DELETE:
              return this._screenApiService.deleteInput(result!.screenInput.id!, this.screen);
          }
        }),
        switchMap(() => this._customColumns.updateColumnsForScreen(this.screen)),
      )
      .subscribe(() => {
        setTimeout(() => {
          this._columnsReconfigure.reconfigureColumns();
        });
      });
  }

  private updateOptions(value?: string | string[]): void {
    let result: string[] = [];
    if (value) {
      result = value instanceof Array ? value : [value];
    }
    this.optionsInternal$.next(result);
  }
}
