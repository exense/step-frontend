import { Component, forwardRef, inject } from '@angular/core';
import {
  AugmentedKeywordPackagesService,
  DialogParentService,
  entitySelectionStateProvider,
  FunctionPackage,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { FunctionPackageActionsService } from '../../injectables/function-package-actions.service';

@Component({
  selector: 'step-function-package-list',
  templateUrl: './function-package-list.component.html',
  styleUrls: ['./function-package-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedKeywordPackagesService.FUNCTION_PACKAGE_TABLE_ID,
    }),
    tablePersistenceConfigProvider('functionPackageList', STORE_ALL),
    ...entitySelectionStateProvider<string, FunctionPackage>('id'),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => FunctionPackageListComponent),
    },
  ],
  standalone: false,
})
export class FunctionPackageListComponent implements DialogParentService {
  private _augApi = inject(AugmentedKeywordPackagesService);
  private _actions = inject(FunctionPackageActionsService);
  readonly dataSource = this._augApi.createDataSource();

  isRefreshing: boolean = false;

  readonly returnParentUrl = '/function-packages';

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
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
      this.dataSource.reload();
    });
  }
}
