import { Injectable } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '../shared';

export type LinkProcessorFn = (context: any) => Promise<unknown>;

@Injectable({
  providedIn: 'root',
})
export class LinkProcessorService {
  private _processors: LinkProcessorFn[] = [];

  registerProcessor(processor: LinkProcessorFn): void {
    this._processors.push(processor);
  }

  process(context: any): Promise<unknown> {
    const promises = this._processors.map((p) => p(context));
    return Promise.all(promises);
  }

  clean(): void {
    this._processors = [];
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('LinkProcessor', downgradeInjectable(LinkProcessorService));
