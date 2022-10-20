import { IPromise, IScope } from 'angular';
import { Injectable } from '@angular/core';
import { INJECTOR } from '../modules/basics/step-basics.module';

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('IsUsedByDialogs'),
  deps: [INJECTOR],
})
export abstract class IsUsedByDialogsService {
  abstract displayDialog(title: string, type: string, id: string): IPromise<unknown>;
}
