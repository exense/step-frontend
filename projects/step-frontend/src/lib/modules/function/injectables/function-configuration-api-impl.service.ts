import { inject, Injectable } from '@angular/core';
import { AugmentedKeywordsService, Keyword, FunctionConfigurationApiService } from '@exense/step-core';
import { Observable } from 'rxjs';

@Injectable()
export class FunctionConfigurationApiImplService implements FunctionConfigurationApiService {
  private _functionApiService = inject(AugmentedKeywordsService);

  newFunctionTypeConf(type: string): Observable<Keyword> {
    return this._functionApiService.newFunctionTypeConf(type);
  }

  saveFunction(keyword?: Keyword): Observable<Keyword> {
    return this._functionApiService.saveFunction(keyword);
  }

  getFunctionEditor(id: string): Observable<string> {
    return this._functionApiService.getFunctionEditor(id);
  }
}
