import { Component, Inject, Input, SimpleChanges } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { a1Promise2Observable, AJS_MODULE, AJS_ROOT_SCOPE, DialogsService } from '@exense/step-core';
import { HttpClient } from '@angular/common/http';
import { FunctionPackageDialogsService } from '../../servies/function-package-dialogs.service';
import { IRootScopeService } from 'angular';

@Component({
  selector: 'function-package-link',
  templateUrl: './function-package-link.component.html',
  styleUrls: ['./function-package-link.component.scss'],
})
export class FunctionPackageLinkComponent {
  @Input() id?: string;
  functionPackage?: any = false;
  isRefreshing: boolean = false;

  constructor(
    private _httpClient: HttpClient,
    private _functionPackageDialogsService: FunctionPackageDialogsService,
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
    a1Promise2Observable(
      this._dialogs.showDeleteWarning(1, 'Keyword Package "' + this.functionPackage.attributes.name + '"')
    )
      .subscribe(() =>
        this._httpClient.delete<any>(`rest/functionpackages/${this.id!}`).subscribe(() => {
          this.reload();
        })
      )
      .add(() => (this.isRefreshing = false));
  }

  refresh() {
    this.isRefreshing = true;
    this._httpClient
      .get<any>(`rest/functionpackages/${this.id!}/reload`)
      .subscribe(() => {
        this.reload();
      })
      .add(() => (this.isRefreshing = false));
  }

  edit() {
    this.isRefreshing = true;
    this._functionPackageDialogsService
      .editFunctionPackage(this.id!)
      .subscribe()
      .add(() => (this.isRefreshing = false));
  }

  reload() {
    this._$rootScope.$broadcast('functions.collection.change', {});
    this.loadFunctionPackage();
  }

  loadFunctionPackage() {
    this._httpClient.get<any>(`rest/functionpackages/${this.id!}`).subscribe((response) => {
      this.functionPackage = response;
    });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('function-package-link', downgradeComponent({ component: FunctionPackageLinkComponent }));
