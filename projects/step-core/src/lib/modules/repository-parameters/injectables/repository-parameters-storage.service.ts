import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PrivateApplicationService } from '../../../client/step-client-module';

@Injectable({
  providedIn: 'root',
})
export class RepositoryParametersStorageService {
  private _api = inject(PrivateApplicationService);

  private parametersInternal: ReadonlyArray<string> = [];

  get parameters(): ReadonlyArray<string> {
    return this.parametersInternal;
  }

  loadParameters(): Observable<string[]> {
    return this._api.getAllRepositoriesCanonicalParameters().pipe(
      tap((parameters) => {
        this.parametersInternal = parameters;
      }),
    );
  }
}
