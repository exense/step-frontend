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
  IsUsedByDialogService,
  CustomCellRegistryService,
  tableColumnsConfigProvider,
} from '@exense/step-core';
import { FunctionConfigurationApiImplService } from '../../injectables/function-configuration-api-impl.service';

@Component({
  selector: 'step-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedKeywordsService.FUNCTIONS_TABLE_ID,
      entityScreenId: 'keyword',
      entityScreenDefaultVisibleFields: ['attributes.name'],
    }),
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
  standalone: false,
})
export class FunctionListComponent implements DialogParentService {
  private _functionApiService = inject(AugmentedKeywordsService);
  private _functionActions = inject(FunctionActionsService);
  private _keywordExecutor = inject(KeywordExecutorService);
  private _isUsedByDialog = inject(IsUsedByDialogService);

  readonly _hasPackages = !!inject(CustomCellRegistryService).getItemInfo('functionPackageLink');
  readonly dataSource = this._functionApiService.createFilteredTableDataSource();
  readonly returnParentUrl = '/functions';

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
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

  lookUp(id: string, name: string): void {
    this._isUsedByDialog.displayDialog(`Keyword "${name}" is used by`, 'KEYWORD_ID', id);
  }
}
