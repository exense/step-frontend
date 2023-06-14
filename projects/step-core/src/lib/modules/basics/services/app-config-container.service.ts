import { Injectable } from '@angular/core';
import { ApplicationConfiguration } from '../../../client/step-client-module';
import { Mutable } from '../../../shared';

type FieldAccessor = Mutable<Pick<AppConfigContainerService, 'conf'>>;

@Injectable({
  providedIn: 'root',
})
export class AppConfigContainerService {
  readonly conf?: ApplicationConfiguration;

  setConfiguration(conf: ApplicationConfiguration): void {
    (this as FieldAccessor).conf = conf;
  }
}
