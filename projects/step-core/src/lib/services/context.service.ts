import { Inject, Injectable } from '@angular/core';
import { AJS_ROOT_SCOPE } from '../shared';
import { IRootScopeService } from 'angular';

@Injectable({
  providedIn: 'root',
})
export class ContextService {
  constructor(@Inject(AJS_ROOT_SCOPE) private _$rootScope: IRootScopeService) {}

  get userName(): string {
    return (this._$rootScope as any)?.context?.userID;
  }
}
