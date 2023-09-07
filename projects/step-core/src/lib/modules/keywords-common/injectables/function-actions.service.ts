import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { FunctionDialogsConfig } from '../types/function-dialogs-config.interface';
import { Function as Keyword } from '../../../client/step-client-module';

export abstract class FunctionActionsService {
  abstract openAddFunctionModal(
    parentInjector: Injector,
    dialogConfig?: FunctionDialogsConfig
  ): Observable<Keyword | undefined>;
  abstract openFunctionEditor(keyword: Keyword): Observable<boolean | undefined>;
  abstract openLookUpFunctionDialog(id: string, name: string): void;
  abstract configureFunction(
    parentInjector: Injector,
    id: string,
    dialogConfig?: FunctionDialogsConfig
  ): Observable<Keyword | undefined>;
  abstract openDeleteFunctionDialog(id: string, name: string): Observable<boolean>;
  abstract openExportFunctionDialog(id: string, name: string): Observable<boolean>;
  abstract openExportAllFunctionsDialog(): Observable<boolean>;
  abstract openImportFunctionDialog(): Observable<boolean | string[]>;
  abstract selectFunction(): Observable<Keyword>;
  abstract resolveConfigureLinkIfExits(parentInjector: Injector, dialogConfig?: FunctionDialogsConfig): void;
}
