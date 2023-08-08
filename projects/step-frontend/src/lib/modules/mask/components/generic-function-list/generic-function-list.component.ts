import { AfterViewInit, Component, inject, Input, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_LOCATION,
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  AugmentedKeywordsService,
  AutoDeselectStrategy,
  BulkOperationsInvokeService,
  BulkOperationType,
  Function as KeywordFunction,
  InteractivePlanExecutionService,
  selectionCollectionProvider,
  StepDataSource,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { GenericFunctionBulkOperationsInvokeService } from '../services/generic-function-bulk-operations-invoke.service';
import { GenericFunctionDialogService } from '../services/generic-function-dialogs.service';

@Component({
  selector: 'step-generic-function-list',
  templateUrl: './generic-function-list.component.html',
  styleUrls: ['./generic-function-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('genericFunctionList', STORE_ALL),
    selectionCollectionProvider<string, KeywordFunction>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: GenericFunctionBulkOperationsInvokeService,
    },
  ],
})
export class GenericFunctionListComponent implements OnInit, AfterViewInit {
  private _interactivePlanExecutionService = inject(InteractivePlanExecutionService);
  private _genericFunctionDialogService = inject(GenericFunctionDialogService);
  private _augmentedKeywordsService = inject(AugmentedKeywordsService);
  private _$rootScope = inject(AJS_ROOT_SCOPE);
  private _location = inject(AJS_LOCATION);

  @Input() filter?: string[];
  @Input() filterClass?: string[];
  @Input() title?: string;
  @Input() serviceRoot?: string;

  protected dataSource?: StepDataSource<KeywordFunction>;

  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'mask-delete' },
    { operation: BulkOperationType.duplicate, permission: 'kw-write' },
  ];

  ngOnInit(): void {
    this._genericFunctionDialogService.configure({
      title: this.title ?? '',
      serviceRoot: this.serviceRoot ?? '',
      filterClass: this.filterClass ?? [],
    });
  }

  ngAfterViewInit(): void {
    this.dataSource = this._augmentedKeywordsService.createFilteredTableDataSource(this.filter);
  }

  addMask(): void {
    this._genericFunctionDialogService.openAddMaskDialog().subscribe(() => this.dataSource?.reload());
  }

  editFunction(keyword: KeywordFunction): void {
    this._genericFunctionDialogService.openEditMaskDialog(keyword);
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
    this._genericFunctionDialogService.openDeleteDialog(id, name).subscribe((result) => {
      if (result) {
        this.dataSource?.reload();
      }
    });
  }

  lookUp(id: string, name: string): void {
    this._genericFunctionDialogService.openLookupDialog(id, name);
  }

  configureFunction(id: string) {
    this._genericFunctionDialogService.openConfigDialog(id).subscribe(() => this.dataSource?.reload());
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepGenericFunctionList', downgradeComponent({ component: GenericFunctionListComponent }));
