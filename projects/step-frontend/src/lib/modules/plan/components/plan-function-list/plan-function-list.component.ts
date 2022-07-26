import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_LOCATION,
  AJS_MODULE,
  AugmentedKeywordsService,
  FunctionPackage,
  TableRemoteDataSource,
} from '@exense/step-core';
import { ILocationService } from 'angular';

@Component({
  selector: 'step-plan-function-list',
  templateUrl: './plan-function-list.component.html',
  styleUrls: ['./plan-function-list.component.scss'],
})
export class PlanFunctionListComponent {
  readonly dataSource: TableRemoteDataSource<FunctionPackage> =
    this._functionApiService.createFilteredTableDataSource();

  @Output() onSelection = new EventEmitter<string>();

  constructor(
    readonly _functionApiService: AugmentedKeywordsService,
    private _httpClient: HttpClient,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  addFunction(id: string): void {
    this.onSelection.emit(id);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanFunctionList', downgradeComponent({ component: PlanFunctionListComponent }));
