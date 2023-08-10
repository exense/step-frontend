import { AfterViewInit, Component, inject, Injector, Input, OnInit } from '@angular/core';
import {
  AugmentedKeywordsService,
  Function as Keyword,
  InteractivePlanExecutionService,
  StepDataSource,
} from '../../client/step-client-module';
import {
  BulkOperationsInvokeService,
  BulkOperationType,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '../../modules/table/table.module';
import {
  AutoDeselectStrategy,
  selectionCollectionProvider,
} from '../../modules/entities-selection/entities-selection.module';
import {
  FunctionActionsService,
  FunctionDialogsConfig,
  FunctionDialogsConfigFactoryService,
  GenericFunctionBulkOperationsInvokeService,
} from '../../modules/keywords-common/keywords-common.module';
import { AJS_LOCATION, AJS_ROOT_SCOPE } from '../../shared';

@Component({
  selector: 'step-generic-function-list',
  templateUrl: './generic-function-list.component.html',
  styleUrls: ['./generic-function-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('genericFunctionList', STORE_ALL),
    selectionCollectionProvider<string, Keyword>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: GenericFunctionBulkOperationsInvokeService,
    },
  ],
})
export class GenericFunctionListComponent implements OnInit, AfterViewInit {
  private _functionDialogsConfigFactoryService = inject(FunctionDialogsConfigFactoryService);
  private _functionActions = inject(FunctionActionsService);

  private config?: FunctionDialogsConfig;

  private _injector = inject(Injector);
  private _interactivePlanExecutionService = inject(InteractivePlanExecutionService);
  private _augmentedKeywordsService = inject(AugmentedKeywordsService);
  private _$rootScope = inject(AJS_ROOT_SCOPE);
  private _location = inject(AJS_LOCATION);

  @Input() filter?: string[];
  @Input() filterClass?: string[];
  @Input() title?: string;

  protected dataSource?: StepDataSource<Keyword>;

  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'mask-delete' },
    { operation: BulkOperationType.duplicate, permission: 'kw-write' },
  ];

  ngOnInit(): void {
    this.configure({
      title: this.title ?? '',
      filterClass: this.filterClass ?? [],
    });
  }

  ngAfterViewInit(): void {
    this.dataSource = this._augmentedKeywordsService.createFilteredTableDataSource(this.filter);
  }

  private configure(options?: { title?: string; filterClass?: string[] }): void {
    this.config = this._functionDialogsConfigFactoryService.getConfigObject(
      options?.title ?? '',
      options?.filterClass ?? [],
      true,
      'functionTable'
    );
  }

  addMask(): void {
    this._functionActions.openAddFunctionModal(this._injector, this.config).subscribe(() => this.dataSource?.reload());
  }

  editFunction(keyword: Keyword): void {
    this._functionActions.openFunctionEditor(keyword).subscribe();
  }

  executeFunction(id: string): void {
    this._interactivePlanExecutionService.startFunctionTestingSession(id).subscribe((result: any) => {
      (this._$rootScope as any).planEditorInitialState = {
        interactive: true,
        selectedNode: result.callFunctionId,
      };
      this._location.path('/root/plans/editor/' + result.planId);
    });
  }

  duplicateFunction(id: string): void {
    this._augmentedKeywordsService.cloneFunction(id).subscribe(() => this.dataSource?.reload());
  }

  deleteFunction(id: string, name: string): void {
    this._functionActions.openDeleteFunctionDialog(id, name).subscribe((result) => {
      if (result) {
        this.dataSource?.reload();
      }
    });
  }

  lookUp(id: string, name: string): void {
    return this._functionActions.openLookUpFunctionDialog(id, name);
  }

  configureFunction(id: string) {
    this._functionActions.configureFunction(this._injector, id, this.config).subscribe(() => this.dataSource?.reload());
  }
}
