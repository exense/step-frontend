import { AfterViewInit, Component, inject, Injector } from '@angular/core';
import {
  AugmentedKeywordsService,
  AutoDeselectStrategy,
  Keyword,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
  FunctionActionsService,
  KeywordExecutorService,
} from '@exense/step-core';

@Component({
  selector: 'step-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('functionList', STORE_ALL),
    ...selectionCollectionProvider<string, Keyword>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class FunctionListComponent implements AfterViewInit {
  private _injector = inject(Injector);
  private _functionApiService = inject(AugmentedKeywordsService);
  private _functionActions = inject(FunctionActionsService);
  private _keywordExecutor = inject(KeywordExecutorService);

  readonly dataSource = this._functionApiService.createFilteredTableDataSource();

  ngAfterViewInit(): void {
    this._functionActions.resolveConfigureLinkIfExits(this._injector);
  }

  addFunction(): void {
    this._functionActions.openAddFunctionModal(this._injector).subscribe(() => this.dataSource.reload());
  }

  /*
  addFunctionPackage(): void {
    this._functionPackageDialogs.openAddFunctionPackageDialog().subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }
*/

  editFunction(keyword: Keyword): void {
    this._functionActions.openFunctionEditor(keyword).subscribe();
  }

  executeFunction(id: string): void {
    this._keywordExecutor.executeKeyword(id);
  }

  duplicateFunction(id: string): void {
    this._functionApiService.cloneFunction(id).subscribe(() => this.dataSource.reload());
  }

  deleteFunction(id: string, name: string): void {
    this._functionActions.openDeleteFunctionDialog(id, name).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  exportFunction(id: string, name: string): void {
    this._functionActions.openExportFunctionDialog(id, name).subscribe(() => this.dataSource.reload());
  }

  exportFunctions(): void {
    this._functionActions.openExportAllFunctionsDialog().subscribe(() => this.dataSource.reload());
  }

  importFunctions(): void {
    this._functionActions.openImportFunctionDialog().subscribe(() => this.dataSource.reload());
  }

  lookUp(id: string, name: string): void {
    this._functionActions.openLookUpFunctionDialog(id, name);
  }

  configureFunction(id: string): void {
    this._functionActions.configureFunction(this._injector, id).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }
}
