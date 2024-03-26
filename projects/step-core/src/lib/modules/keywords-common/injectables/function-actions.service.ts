import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { FunctionDialogsConfig } from '../types/function-dialogs-config.interface';
import { Keyword } from '../../../client/step-client-module';

export abstract class FunctionActionsService {
  abstract openFunctionEditor(keyword: Keyword): Observable<boolean | undefined>;
  abstract resolveConfigurerUrl(idOrKeyword: Keyword | string): string;
  abstract openDeleteFunctionDialog(id: string, name: string): Observable<boolean>;
}
