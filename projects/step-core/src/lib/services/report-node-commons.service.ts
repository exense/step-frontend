import { Injectable } from '@angular/core';
import { INJECTOR } from '../modules/basics/step-basics.module';
import { ScreenInput } from '../client/generated';

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('ReportNodeCommons'),
  deps: [INJECTOR],
})
export abstract class ReportNodeCommonsService {
  abstract getFunctionAttributes(): ScreenInput[];
}
