import { Component, Inject } from '@angular/core';
import {
  AJS_ROOT_SCOPE,
  CustomComponent,
  DialogsService,
  Function as KeywordFunction,
  FunctionPackage,
  KeywordPackagesService,
} from '@exense/step-core';
import { FunctionPackageActionsService } from '../../services/function-package-actions.service';
import { IRootScopeService } from 'angular';

@Component({
  selector: 'step-function-package-link',
  templateUrl: './function-package-link.component.html',
  styleUrls: ['./function-package-link.component.scss'],
})
export class FunctionPackageLinkComponent implements CustomComponent {
  private innerContext?: KeywordFunction;

  get context(): KeywordFunction | undefined {
    return this.innerContext;
  }

  set context(value: KeywordFunction | undefined) {
    if (value === this.innerContext) {
      return;
    }
    this.innerContext = value;
    if (!!this.innerContext?.id) {
      this.loadFunctionPackage();
    }
  }

  private get functionPackageId(): string {
    return this.innerContext?.customFields?.['functionPackageId'];
  }

  functionPackage?: FunctionPackage;
  isRefreshing: boolean = false;

  constructor(
    private _api: KeywordPackagesService,
    private _functionPackageActionsService: FunctionPackageActionsService,
    private _dialogs: DialogsService,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService
  ) {}

  delete(): void {
    if (!this.functionPackageId) {
      return;
    }
    this.isRefreshing = true;
    this._functionPackageActionsService
      .deleteFunctionPackage(this.functionPackageId, this.functionPackage!.attributes!['name'])
      .subscribe((result) => {
        if (result) {
          this.reload();
        }
      })
      .add(() => (this.isRefreshing = false));
  }

  refresh(): void {
    if (!this.functionPackageId) {
      return;
    }
    this.isRefreshing = true;
    this._api
      .reloadFunctionPackage(this.functionPackageId)
      .subscribe(() => {
        this.reload();
      })
      .add(() => (this.isRefreshing = false));
  }

  edit(): void {
    if (!this.functionPackageId) {
      return;
    }
    this.isRefreshing = true;
    this._functionPackageActionsService
      .editFunctionPackage(this.functionPackageId)
      .subscribe()
      .add(() => (this.isRefreshing = false));
  }

  reload(): void {
    this._$rootScope.$broadcast('functions.collection.change', {});
    this.loadFunctionPackage();
  }

  private loadFunctionPackage(): void {
    if (!this.functionPackageId) {
      this.functionPackage = undefined;
      return;
    }
    this._api.getFunctionPackage(this.functionPackageId).subscribe((response) => {
      this.functionPackage = response;
    });
  }
}
