import { Injectable } from '@angular/core';
import { INJECTOR } from '../shared/angularjs-provider-options';

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('ExportService'),
  deps: [INJECTOR],
})
export abstract class ExportService {
  abstract pollUrl(exportUrl: string, callback?: () => void): void;
  abstract poll(exportId: string, callback?: () => void): void;
  abstract get(exportUrl: string, callback?: () => void): void;
}
