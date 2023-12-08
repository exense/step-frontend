import { AfterViewInit, Component, inject } from '@angular/core';
import {
  AugmentedKeywordPackagesService,
  AutoDeselectStrategy,
  FunctionPackage,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { FunctionPackageActionsService } from '../../services/function-package-actions.service';

@Component({
  selector: 'step-function-package-list',
  templateUrl: './function-package-list.component.html',
  styleUrls: ['./function-package-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('functionPackageList', STORE_ALL),
    selectionCollectionProvider<string, FunctionPackage>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class FunctionPackageListComponent implements AfterViewInit {
  private _augApi = inject(AugmentedKeywordPackagesService);
  private _actions = inject(FunctionPackageActionsService);
  readonly dataSource = this._augApi.createDataSource();

  isRefreshing: boolean = false;

  ngAfterViewInit(): void {
    this._actions.resolveEditLinkIfExists();
  }

  add(): void {
    this._actions.openAddFunctionPackageDialog().subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  edit(functionPackage: FunctionPackage): void {
    this._actions.editFunctionPackage(functionPackage).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
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
