import { Injectable } from '@angular/core';
import { INJECTOR } from '../modules/basics/step-basics.module';

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('ExportService'),
  deps: [INJECTOR],
})
export abstract class ExportService {
  abstract get(url: string): void;
  abstract poll(exportId: string): void;
}
