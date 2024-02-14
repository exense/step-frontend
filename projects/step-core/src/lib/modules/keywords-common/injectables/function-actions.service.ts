import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { FunctionDialogsConfig } from '../types/function-dialogs-config.interface';
import { Keyword } from '../../../client/step-client-module';

export abstract class FunctionActionsService {
  abstract readonly baseUrl: string;
  abstract addFunction(): void;
  abstract openFunctionEditor(keyword: Keyword): Observable<boolean | undefined>;
  abstract duplicateFunction(keyword: Keyword): Observable<boolean>;
  abstract openLookUpFunctionDialog(id: string, name: string): void;
  abstract configureFunction(id: string): void;
  abstract openDeleteFunctionDialog(id: string, name: string): Observable<boolean>;
  abstract openExportFunctionDialog(id: string): void;
  abstract openExportAllFunctionsDialog(): void;
  abstract openImportFunctionDialog(): void;
}
