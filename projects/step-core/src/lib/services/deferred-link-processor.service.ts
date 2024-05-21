import { inject, Injectable, Injector, Type } from '@angular/core';
import { LinkProcessorFn, LinkProcessorService } from './link-processor.service';
import { InvokeRunRegister } from './invoke-run.service';

export abstract class LinkProcessor {
  abstract process: LinkProcessorFn;
}

@Injectable({
  providedIn: 'root',
})
export class DeferredLinkProcessorService implements Pick<LinkProcessorService, 'registerProcessor'> {
  private _injector = inject(Injector);
  private _invokeRunRegister = inject(InvokeRunRegister);

  private get _linkProcessor(): LinkProcessorService {
    return this._injector.get(LinkProcessorService);
  }

  registerProcessor(processor: LinkProcessorFn): void {
    this._invokeRunRegister.registerRun(() => this._linkProcessor.registerProcessor(processor));
  }

  registerProcessorService<T extends LinkProcessor>(processorServiceT: Type<T>): void {
    this._invokeRunRegister.registerRun(() => {
      const linkProcessor = this._injector.get(processorServiceT, undefined);
      if (!linkProcessor) {
        return;
      }
      this._linkProcessor.registerProcessor((context) => linkProcessor.process(context));
    });
  }
}
