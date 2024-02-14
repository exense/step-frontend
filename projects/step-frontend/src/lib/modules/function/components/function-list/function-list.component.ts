import { Component, forwardRef, inject } from '@angular/core';
import {
  AugmentedKeywordsService,
  AutoDeselectStrategy,
  Keyword,
  selectionCollectionProvider,
  tablePersistenceConfigProvider,
  STORE_ALL,
  FunctionActionsService,
  KeywordExecutorService,
  FunctionConfigurationApiService,
  DialogParentService,
} from '@exense/step-core';
import { FunctionConfigurationApiImplService } from '../../injectables/function-configuration-api-impl.service';

@Component({
  selector: 'step-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('functionList', STORE_ALL),
    ...selectionCollectionProvider<string, Keyword>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: FunctionConfigurationApiService,
      useClass: FunctionConfigurationApiImplService,
    },
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => FunctionListComponent),
    },
  ],
})
export class FunctionListComponent implements DialogParentService {
  private _functionApiService = inject(AugmentedKeywordsService);
  private _functionActions = inject(FunctionActionsService);
  private _keywordExecutor = inject(KeywordExecutorService);

  readonly dataSource = this._functionApiService.createFilteredTableDataSource();
  readonly returnParentUrl = this._functionActions.baseUrl;

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  addFunction(): void {
    this._functionActions.addFunction();
  }

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

  exportFunction(id: string): void {
    this._functionActions.openExportFunctionDialog(id);
  }

  exportFunctions(): void {
    this._functionActions.openExportAllFunctionsDialog();
  }

  importFunctions(): void {
    this._functionActions.openImportFunctionDialog();
  }

  lookUp(id: string, name: string): void {
    this._functionActions.openLookUpFunctionDialog(id, name);
  }

  configureFunction(id: string): void {
    this._functionActions.configureFunction(id);
  }
}
