import { Component, inject } from '@angular/core';
import {
  AJS_MODULE,
  AugmentedKeywordPackagesService,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { FunctionPackageActionsService } from '../../services/function-package-actions.service';

@Component({
  selector: 'step-function-package-list',
  templateUrl: './function-package-list.component.html',
  styleUrls: ['./function-package-list.component.scss'],
  providers: [tablePersistenceConfigProvider('functionPackageList', STORE_ALL)],
})
export class FunctionPackageListComponent {
  private _augApi = inject(AugmentedKeywordPackagesService);
  private _actions = inject(FunctionPackageActionsService);
  readonly dataSource = this._augApi.dataSource;

  isRefreshing: boolean = false;

  add(): void {
    this._actions.openAddFunctionPackageDialog().subscribe(() => this.dataSource.reload());
  }

  edit(id: string): void {
    this._actions.editFunctionPackage(id).subscribe(() => this.dataSource.reload());
  }

  refresh(id: string): void {
    this.isRefreshing = true;
    this._augApi
      .reloadFunctionPackage(id)
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
