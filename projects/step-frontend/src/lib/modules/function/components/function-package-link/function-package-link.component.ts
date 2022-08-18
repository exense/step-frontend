import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, AJS_ROOT_SCOPE, DialogsService, FunctionPackage, KeywordPackagesService } from '@exense/step-core';
import { FunctionPackageActionsService } from '../../services/function-package-actions.service';
import { IRootScopeService } from 'angular';

@Component({
  selector: 'function-package-link',
  templateUrl: './function-package-link.component.html',
  styleUrls: ['./function-package-link.component.scss'],
})
export class FunctionPackageLinkComponent {
  @Input() id?: string;
  functionPackage?: FunctionPackage;
  isRefreshing: boolean = false;

  constructor(
    private _api: KeywordPackagesService,
    private _functionPackageActionsService: FunctionPackageActionsService,
    private _dialogs: DialogsService,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!this.id) {
      return;
    }

    if (changes['id'].isFirstChange() || changes['id'].previousValue !== changes['id'].currentValue) {
      this.loadFunctionPackage();
    }
  }

  delete() {
    this.isRefreshing = true;
    this._functionPackageActionsService
      .deleteFunctionPackage(this.id!, this.functionPackage!.attributes!['name'])
      .subscribe((result) => {
        if (result) {
          this.reload();
        }
      })
      .add(() => (this.isRefreshing = false));
  }

  refresh() {
    this.isRefreshing = true;
    this._api
      .reloadFunctionPackage(this.id!)
      .subscribe(() => {
        this.reload();
      })
      .add(() => (this.isRefreshing = false));
  }

  edit() {
    this.isRefreshing = true;
    this._functionPackageActionsService
      .editFunctionPackage(this.id!)
      .subscribe()
      .add(() => (this.isRefreshing = false));
  }

  reload() {
    this._$rootScope.$broadcast('functions.collection.change', {});
    this.loadFunctionPackage();
  }

  loadFunctionPackage() {
    this._api.getFunctionPackage(this.id!).subscribe((response) => {
      this.functionPackage = response;
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('function-package-link', downgradeComponent({ component: FunctionPackageLinkComponent }));
