import { Component, inject } from '@angular/core';
import { CustomComponent, Keyword, FunctionPackage, KeywordPackagesService } from '@exense/step-core';
import { FunctionPackageActionsService } from '../../injectables/function-package-actions.service';

@Component({
  selector: 'step-function-package-link',
  templateUrl: './function-package-link.component.html',
  styleUrls: ['./function-package-link.component.scss'],
  standalone: false,
})
export class FunctionPackageLinkComponent implements CustomComponent {
  private _api = inject(KeywordPackagesService);
  private _functionPackageActionsService = inject(FunctionPackageActionsService);

  private innerContext?: Keyword;

  get context(): Keyword | undefined {
    return this.innerContext;
  }

  set context(value: Keyword | undefined) {
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

  reload(): void {
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
