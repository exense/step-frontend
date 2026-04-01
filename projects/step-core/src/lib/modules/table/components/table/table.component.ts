import {
  AfterViewInit,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  TemplateRef,
  TrackByFunction,
  untracked,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { SearchColDirective } from '../../directives/search-col.directive';
import { TableRemoteDataSource } from '../../shared/table-remote-data-source';
import { SearchValue } from '../../shared/search-value';
import { ColumnDirective } from '../../directives/column.directive';
import { AdditionalHeaderDirective } from '../../directives/additional-header.directive';
import { SearchColumn } from '../../shared/search-column.interface';
import { TableHighlightItemContainer } from '../../services/table-highlight-item-container.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableCustomColumnsService } from '../../services/table-custom-columns.service';
import { CustomColumnsComponent } from '../custom-columns/custom-columns.component';
import { TableColumnsService } from '../../services/table-columns.service';
import { TableColumnsDefinitionService } from '../../services/table-columns-definition.service';
import { TableColumnsDictionaryService } from '../../services/table-columns-dictionary.service';
import { ColumnInfo } from '../../types/column-info';
import { RowsExtensionDirective } from '../../directives/rows-extension.directive';
import { RowDirective } from '../../directives/row.directive';
import { ColumnsPlaceholdersComponent } from '../columns-placeholders/columns-placeholders.component';
import { TablePaginatorPrefixDirective } from '../../directives/table-paginator-prefix.directive';
import { TablePaginatorContentDirective } from '../../directives/table-paginator-content.directive';
import { TablePartPaginationDirective } from '../../directives/table-part-pagination.directive';
import { PaginatorComponent } from '../paginator/paginator.component';
import { TablePartSearchDirective } from '../../directives/table-part-search.directive';
import { TableSearch, TableSearchParams } from '../../services/table-search';
import { TablePartParamsAndFiltersDirective } from '../../directives/table-part-params-and-filters.directive';
import { TablePartDatasourceDirective } from '../../directives/table-part-datasource.directive';
import { TablePartSelectionListDirective } from '../../directives/table-part-selection-list.directive';
import { TablePartSortDirective } from '../../directives/table-part-sort.directive';
import { TablePartReloadDirective } from '../../directives/table-part-reload.directive';
import { TableReload } from '../../services/table-reload';
import { EmptyState } from '../../shared/empty-state.enum';
import { TablePartIndicatorDirective } from '../../directives/table-part-indicator.directive';

@Component({
  selector: 'step-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [
    TablePartSelectionListDirective,
    {
      directive: TablePartPaginationDirective,
      inputs: ['pageSizeInputDisabled'],
    },
    TablePartSortDirective,
    {
      directive: TablePartSearchDirective,
      inputs: ['defaultSearch'],
    },
    {
      directive: TablePartParamsAndFiltersDirective,
      inputs: ['staticFilters', 'tableParams', 'filter'],
    },
    {
      directive: TablePartDatasourceDirective,
      inputs: ['dataSource', 'calculateCounts'],
    },
    {
      directive: TablePartReloadDirective,
      inputs: ['blockGlobalReload'],
      outputs: ['reloadData'],
    },
    {
      directive: TablePartIndicatorDirective,
      inputs: ['indicatorMode', 'inProgress'],
    },
  ],
  providers: [
    {
      provide: TableHighlightItemContainer,
      useExisting: forwardRef(() => TableComponent),
    },
    {
      provide: TableColumnsDictionaryService,
      useExisting: forwardRef(() => TableComponent),
    },
    TableColumnsDefinitionService,
    TableCustomColumnsService,
    TableColumnsService,
  ],
  standalone: false,
})
export class TableComponent<T>
  implements AfterViewInit, TableSearch, TableReload, TableHighlightItemContainer, TableColumnsDictionaryService
{
  private _destroyRef = inject(DestroyRef);
  private _columnsDefinitions = inject(TableColumnsDefinitionService);
  protected readonly _tableColumns = inject(TableColumnsService);

  protected readonly _tablePagination = inject(TablePartPaginationDirective);
  protected readonly _tableDataSource = inject(TablePartDatasourceDirective);
  private _tableSearch = inject(TablePartSearchDirective);
  private _tableReload = inject(TablePartReloadDirective);
  protected readonly _tableIndicator = inject(TablePartIndicatorDirective);

  private readonly paginator = viewChild(PaginatorComponent);
  private effectPaginatorChange = effect(() => {
    const paginator = this.paginator();
    if (paginator) {
      this._tablePagination.initializePaginator(paginator);
    }
  });

  private hasCustom: boolean = false;
  private isInitialized: boolean = false;

  protected searchColumns: SearchColumn[] = [];

  readonly trackBy = input<TrackByFunction<T>>((index) => index);

  private usedColumns = new Set<string>();

  private readonly isTableReadyToRenderColumns = signal(false);

  private effectColumnsInitialized = effect(() => {
    const isColumnsInitialized = this._tableColumns.isInitialized();
    this._tableDataSource.initialize(isColumnsInitialized);
  });
  protected readonly EmptyState = EmptyState;

  readonly visibleColumns = input(undefined, {
    transform: (source?: string[]) => (!!source ? new Set<string>(source) : undefined),
  });

  readonly noResultsPlaceholder = input<string | undefined>(undefined);

  private readonly table = viewChild(MatTable);

  private readonly additionalHeaders = contentChildren(AdditionalHeaderDirective);
  protected readonly additionalHeaderGroups = computed(() => {
    const additionalHeaders = this.additionalHeaders();
    if (!additionalHeaders) {
      return undefined;
    }
    additionalHeaders
      .filter((header) => !header.headerGroupId)
      .forEach((header, i) => (header.headerGroupId = `non-grouped-header-${i + 1}`));

    const headerGroupIdToHeaders = additionalHeaders.reduce(
      (result, additionalHeader) => {
        const id = additionalHeader.headerGroupId!;
        const headerGroup = (result[id] = result[id] || []);
        headerGroup.push(additionalHeader);
        return result;
      },
      {} as Record<string, AdditionalHeaderDirective[]>,
    );

    return Object.values(headerGroupIdToHeaders);
  });

  private readonly rows = viewChildren(RowDirective);

  protected readonly rowInfos = computed(() => {
    const rows = this.rows();
    const result = (rows ?? []).map((row) => row.getRowInfo()).filter((row) => !!row.data);
    if (!result.length) {
      return undefined;
    }
    return result;
  });

  protected readonly rowsExtension = contentChild(RowsExtensionDirective);

  private readonly contentColumns = contentChildren(ColumnDirective);

  private readonly viewColumns = viewChildren(ColumnDirective);

  private readonly columnsPlaceholder = viewChild(ColumnsPlaceholdersComponent);
  private readonly columnsPlaceholderIds = computed(() => {
    const cols = this.columnsPlaceholder()?.colDef?.() ?? [];
    return cols.map((col) => col.name);
  });

  private readonly columnsUpdateTrigger = signal(0);

  private readonly columns = computed(() => {
    const updateTrigger = this.columnsUpdateTrigger();
    return [...this.contentColumns(), ...this.viewColumns()];
  });

  readonly columnsDictionary = computed(() => {
    const alreadyUsed = new Set<string>();
    return (this.columns() ?? []).reduce((res, column) => {
      const infos: ColumnInfo[] = [];
      for (let info of column.columnInfos) {
        if (!alreadyUsed.has(info.columnId)) {
          infos.push(info);
          alreadyUsed.add(info.columnId);
        }
      }

      return res.concat(infos);
    }, [] as ColumnInfo[]);
  });

  private readonly allCollDef = computed(() => {
    const alreadyUsed = new Set<string>();
    return (this.columns() ?? []).reduce((res, col) => {
      const definitions: MatColumnDef[] = [];
      for (let def of col.columnDefinitions) {
        if (!alreadyUsed.has(def.name)) {
          definitions.push(def);
          alreadyUsed.add(def.name);
        }
      }

      return res.concat(definitions);
    }, [] as MatColumnDef[]);
  });

  private readonly allSearchColDef = computed(() => {
    return (this.columns() ?? [])
      .reduce((res, col) => [...res, ...col.searchColumnDefinitions], [] as SearchColDirective[])
      .filter((x) => !x.isSearchDisabled);
  });

  private readonly customRemoteColumns = viewChild(CustomColumnsComponent);

  readonly displayColumns = computed(() => {
    const isColumnsInitialized = this._tableColumns.isInitialized();
    const columnPlaceholderIds = untracked(() => this.columnsPlaceholderIds());
    const isTableReady = this.isTableReadyToRenderColumns();
    const visibleColumnsByConfig = this._tableColumns.visibleColumns();
    const visibleColumnsByInput = this.visibleColumns();

    if (!isColumnsInitialized) {
      return isTableReady ? columnPlaceholderIds : [];
    }

    if (!visibleColumnsByInput) {
      return visibleColumnsByConfig;
    }
    return visibleColumnsByConfig.filter((col) => visibleColumnsByInput.has(col));
  });

  readonly displaySearchColumns = computed(() => {
    const searchColumnNames = this.displayColumns().map((col) => `search-${col}`);
    const configuredSearchColumnNames = new Set(this.searchColumns.map((col) => col.colName));
    return searchColumnNames.filter((col) => configuredSearchColumnNames.has(col));
  });

  protected handleColumnsChange(): void {
    this.columnsUpdateTrigger.update((value) => (value + 1) % 10);
    setTimeout(() => {
      if (!this.isInitialized) {
        return;
      }
      this.configureColumns();
      this.configureSearchColumns();
      this.addCustomColumnsDefinitionsToRemoteDatasource();
    });
  }

  highlightedItem?: unknown;

  private addCustomColumnsDefinitionsToRemoteDatasource(): void {
    const dataSource = untracked(() => this._tableDataSource.dataSource());
    if (dataSource instanceof TableRemoteDataSource && this.hasCustom) {
      this.columns()!
        .reduce((res, col) => {
          if (!col.isCustom) {
            return res;
          }
          const names = col.columnDefinitions.map((x) => x.name);
          return [...res, ...names];
        }, [] as string[])
        .forEach((name) => {
          (dataSource as TableRemoteDataSource<T>).setColumnMap(name, name);
        });
    }
  }

  ngAfterViewInit(): void {
    const setup = (): void => {
      this.configureColumns();
      this.configureSearchColumns();
      this._columnsDefinitions.setup(this.contentColumns, this.customRemoteColumns);
      this._tableColumns.initialize();

      this.addCustomColumnsDefinitionsToRemoteDatasource();
      this.isInitialized = true;
    };

    const customCols = this.columns()?.filter((col) => col.isCustom) || [];

    if (!customCols?.length) {
      // Invoke setup in next CD cycle to prevent
      // ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => setup());
    } else {
      this.hasCustom = true;
      const ready$ = combineLatest(customCols.map((col) => col.ready$));
      ready$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(setup);
    }
  }

  private configureColumns(): void {
    const table = this.table();
    if (!table) {
      return;
    }
    const columnsPlaceholder = this.columnsPlaceholder()?.colDef?.() ?? [];
    columnsPlaceholder.forEach((col) => {
      if (!this.usedColumns.has(col.name)) {
        this.usedColumns.add(col.name);
        table.addColumnDef(col);
      }
    });

    const allCollDef = this.allCollDef();
    allCollDef.forEach((col) => {
      if (!this.usedColumns.has(col.name) && !col.name.startsWith('search-')) {
        this.usedColumns.add(col.name);
        table.addColumnDef(col);
      }
    });
    this.isTableReadyToRenderColumns.set(true);
  }

  private configureSearchColumns(): void {
    const searchColDef = this.allSearchColDef();

    if (!searchColDef?.length) {
      this.searchColumns = [];
      return;
    }

    const searchColumns = searchColDef.reduce((res, x) => {
      const searchName = x.searchColumnName;
      const template = x?.searchCell?.template;
      res.set(searchName, { searchName, template });
      return res;
    }, new Map<string, { searchName?: string; template?: TemplateRef<any> }>());

    this.searchColumns = this.allCollDef().map((col) => {
      const colName = `search-${col.name}`;
      const { searchName, template } = searchColumns.get(col.name) ?? {};
      return { colName, searchName, template };
    });
  }

  exportAsCSV(fields: string[]): void {
    return this._tableDataSource.exportAsCSV(fields);
  }

  getSearchValue$(column: string): Observable<SearchValue | undefined> {
    return this._tableSearch.getSearchValue$(column);
  }

  onSearch(column: string, searchValue: SearchValue, params?: TableSearchParams): void;
  onSearch(column: string, value: string, regex?: boolean, params?: TableSearchParams): void;
  onSearch(
    column: string,
    searchValue: SearchValue | string,
    regexOrParams?: TableSearchParams | boolean,
    params?: TableSearchParams,
  ): void {
    if (typeof searchValue === 'string') {
      this._tableSearch.onSearch(column, searchValue, regexOrParams as boolean, params);
    } else {
      this._tableSearch.onSearch(column, searchValue, regexOrParams as TableSearchParams);
    }
  }

  reload(isCausedByProjectChange?: boolean): void {
    this._tableReload.reload(isCausedByProjectChange);
  }
}
