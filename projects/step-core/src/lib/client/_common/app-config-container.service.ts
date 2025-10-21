import { Injectable } from '@angular/core';
import { ApplicationConfiguration } from '../generated';

@Injectable({
  providedIn: 'root',
})
export class AppConfigContainerService {
  private confInternal?: ApplicationConfiguration;

  private defaultClientUrl = '/plans/list';

  get conf(): ApplicationConfiguration | undefined {
    return this.confInternal;
  }

  setConfiguration(conf: ApplicationConfiguration): void {
    this.confInternal = conf;
  }

  setDefaultClientUrl(url: string): void {
    this.defaultClientUrl = url;
  }

  getDefaultUrl(forceClientUrl?: boolean): string {
    if (forceClientUrl) {
      return this.defaultClientUrl;
    }
    return this.conf?.defaultUrl ?? this.defaultClientUrl;
  }
}
