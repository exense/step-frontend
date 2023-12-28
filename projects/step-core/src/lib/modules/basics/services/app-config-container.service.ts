import { Injectable } from '@angular/core';
import { ApplicationConfiguration } from '../../../client/step-client-module';
import { Mutable } from '../../../shared';

type FieldAccessor = Mutable<Pick<AppConfigContainerService, 'conf'>>;

@Injectable({
  providedIn: 'root',
})
export class AppConfigContainerService {
  readonly conf?: ApplicationConfiguration;

  private defaultClientUrl = '/plans/list';

  setConfiguration(conf: ApplicationConfiguration): void {
    (this as FieldAccessor).conf = conf;
  }

  setDefaultClientUrl(url: string): void {
    this.defaultClientUrl = url;
  }

  getDefaultUrl(forceClientUrl?: boolean): string {
    if (forceClientUrl) {
      return this.defaultClientUrl;
    }
    let result = this.conf?.defaultUrl ?? this.defaultClientUrl;
    if (result.startsWith('/root')) {
      //TODO: temporary fix, until server side default url isn't reconfigured
      result = result.replace('/root', '');
    }
    return result;
  }
}
