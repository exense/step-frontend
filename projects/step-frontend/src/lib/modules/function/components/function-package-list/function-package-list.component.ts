import { Component } from '@angular/core';
import { AJS_MODULE, AugmentedKeywordPackagesService, FunctionPackage, TableRemoteDataSource } from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { FunctionPackageActionsService } from '../../servies/function-package-actions.service';

@Component({
  selector: 'step-function-package-list',
  templateUrl: './function-package-list.component.html',
  styleUrls: ['./function-package-list.component.scss'],
})
export class FunctionPackageListComponent {
  readonly dataSource: TableRemoteDataSource<FunctionPackage>;

  isRefreshing: boolean = false;

  constructor(private _augApi: AugmentedKeywordPackagesService, private _actions: FunctionPackageActionsService) {
    this.dataSource = _augApi.dataSource;
  }

  add(): void {
    this._actions.addFunctionPackage().subscribe(() => this.dataSource.reload());
  }

  edit(id: string): void {
    this._actions.editFunctionPackage(id).subscribe(() => this.dataSource.reload());
  }

  refresh(id: string): void {
    this.isRefreshing = true;
    this._augApi
      .reload(id)
      .subscribe()
      .add(() => (this.isRefreshing = false));
  }

  delete(id: string, name: string): void {
    this._actions.deleteFunctionPackage(id, name).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepFunctionPackageList', downgradeComponent({ component: FunctionPackageListComponent }));
