import {
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  Injector,
  input,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  QueryList,
  Signal,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { ScreenInput } from '../../../../client/step-client-module';
import { BehaviorSubject, distinctUntilChanged, filter, Subject } from 'rxjs';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../../directives/search-col.directive';
import { CustomColumnOptions } from '../../services/custom-column-options';
import { CustomColumnsBaseComponent } from './custom-columns-base.component';
import { TableCustomColumnsService } from '../../services/table-custom-columns.service';
import { ActivityColDirective } from '../../directives/activity-col.directive';
import { CustomColumnsScreenInputs } from './custom-columns-screen-inputs';
import { ActivatedRoute } from '@angular/router';
import { ScreenDataMetaService } from '../../../basics/injectables/screen-data-meta.service';
import { Reloadable } from '../../../basics/types/reloadable';
import { GlobalReloadService } from '../../../basics/injectables/global-reload.service';

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
  implements
    OnInit,
    OnChanges,
    OnDestroy,
    CustomColumnOptions,
    CustomColumnsBaseComponent,
    CustomColumnsScreenInputs,
    Reloadable
{
  private _activatedRoute = inject(ActivatedRoute);
  private _screenDataMeta = inject(ScreenDataMetaService);
  private _customColumns = inject(TableCustomColumnsService);
  private _globalReload = inject(GlobalReloadService);
  private _injector = inject(Injector);

  private readonly optionsInternal$ = new BehaviorSubject<string[]>([]);
  private columnsReadyInternal$ = new Subject<boolean>();

  readonly options$ = this.optionsInternal$.asObservable();
  readonly columnsReady$ = this.columnsReadyInternal$.pipe(distinctUntilChanged());
  readonly columnsChange = output();

  @Input({ required: true }) screen!: string;
  @Input() entitySubPath?: string;

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

  @ViewChildren(MatColumnDef) colDef?: QueryList<MatColumnDef>;
  @ViewChildren(SearchColDirective) searchColDef?: QueryList<SearchColDirective>;
  @ViewChildren(ActivityColDirective) colDefLabel?: QueryList<ActivityColDirective>;

  ngOnInit(): void {
    this._globalReload.register(this);
    this._screenDataMeta.checkMetaInformationAboutScreenInRoute(this.screen, this._activatedRoute);
    this.columns = this._customColumns.getScreenColumnsSignal(this.screen);
    this.createColumnsChangeEffect();
    this.loadColumns();
  }

  reload(): void {
    this.loadColumns(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cOptions = changes['options'];
    if (cOptions?.currentValue !== cOptions?.previousValue || cOptions?.firstChange) {
      this.updateOptions(cOptions?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this._globalReload.unRegister(this);
    this.optionsInternal$.complete();
    this.columnsReadyInternal$.complete();
  }

  private createColumnsChangeEffect(): void {
    effect(
      () => {
        const columns = this.columns!();
        this.columnsChange.emit();
      },
      { injector: this._injector },
    );
  }

  private loadColumns(clearCache?: boolean): void {
    this._customColumns
      .updateColumnsForScreen(this.screen, clearCache)
      .pipe(filter((isSuccess) => !!isSuccess))
      .subscribe((isSuccess) => {
        setTimeout(() => {
          this.columnsReadyInternal$.next(true);
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
