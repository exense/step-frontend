import { Injectable } from '@angular/core';
import { INJECTOR } from './angularjs-provider-options';

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('ExportService'),
  deps: [INJECTOR],
})
export abstract class ExportService {
  abstract get(url: string): void;
}
