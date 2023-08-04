import { Injectable } from '@angular/core';
import { ApplicationConfiguration } from '../../../client/step-client-module';
import { Mutable } from '../../../shared';

type FieldAccessor = Mutable<Pick<AppConfigContainerService, 'conf'>>;

@Injectable({
  providedIn: 'root',
})
export class AppConfigContainerService {
  readonly conf?: ApplicationConfiguration;

  private defaultClientUrl = '/root/plans/list';

  setConfiguration(conf: ApplicationConfiguration): void {
    (this as FieldAccessor).conf = conf;
  }

  setDefaultClientUrl(url: string): void {
    this.defaultClientUrl = url;
  }

  get defaultUrl(): string {
    return this.conf?.defaultUrl ?? this.defaultClientUrl;
  }
}
