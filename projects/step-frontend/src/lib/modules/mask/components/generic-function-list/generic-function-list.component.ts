import { Component, Inject, Input, OnInit } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { GenericFunctionDialogService } from '../services/generic-function-dialogs.service';
import {
  AJS_FUNCTION_TYPE_REGISTRY,
  AJS_LOCATION,
  AJS_MODULE,
  AJS_ROOT_SCOPE,
  InteractivePlanExecutionService,
  TableRemoteDataSource,
  AugmentedKeywordsService,
  FunctionPackage,
} from '@exense/step-core';
import { noop } from 'rxjs';
import { ILocationService, IRootScopeService } from 'angular';

@Component({
  selector: 'step-generic-function-list',
  templateUrl: './generic-function-list.component.html',
  styleUrls: ['./generic-function-list.component.scss'],
})
export class GenericFunctionListComponent implements OnInit {
  @Input() filter?: [string];
  @Input() filterclass?: [string];
  @Input() title?: string;
  @Input() serviceroot?: string;

  readonly dataSource: TableRemoteDataSource<FunctionPackage> =
    this._augmentedKeywordsService.createFilteredTableDataSource(this.filter);

  constructor(
    private _interactivePlanExecutionService: InteractivePlanExecutionService,
    private _genericFunctionDialogService: GenericFunctionDialogService,
    private _augmentedKeywordsService: AugmentedKeywordsService,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService,
    @Inject(AJS_LOCATION) private _location: ILocationService,
    @Inject(AJS_FUNCTION_TYPE_REGISTRY) private _functionTypeRegistry: any
  ) {}

  ngOnInit() {
    this._genericFunctionDialogService.configure(this.title, this.serviceroot, this.filterclass);
  }

  addMask(): void {
    this._genericFunctionDialogService.openAddMaskDialog().subscribe((_) => this.dataSource.reload());
  }

  editFunction(id: string): void {
    this._genericFunctionDialogService.openEditMaskDialog(id);
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
    this._augmentedKeywordsService.copyFunction(id).subscribe((_) => this.dataSource.reload());
  }

  deleteFunction(id: string, name: string): void {
    this._genericFunctionDialogService.openDeleteDialog(id, name).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  lookUp(id: string, name: string): void {
    this._genericFunctionDialogService.openLookupDialog(id, name).subscribe(noop);
  }

  configureFunction(id: string) {
    this._genericFunctionDialogService.openConfigDialog(id).subscribe((_) => this.dataSource.reload());
  }

  functionTypeLabel(type: string) {
    return this._functionTypeRegistry.getLabel(type);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepGenericFunctionList', downgradeComponent({ component: GenericFunctionListComponent }));
